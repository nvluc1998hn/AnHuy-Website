(function () {
  function hasSupabaseConfig() {
    return Boolean(window.AppConfig?.supabaseUrl && window.AppConfig?.supabasePublishableKey);
  }

  function getSupabaseHeaders() {
    const publishableKey = window.AppConfig.supabasePublishableKey;
    const headers = {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    };

    if (publishableKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${publishableKey}`;
    }

    return headers;
  }

  async function fetchJson(path) {
    const baseUrl = window.AppConfig.supabaseUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
      headers: getSupabaseHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`);
    }

    return response.json();
  }

  function buildAssetUrl(image) {
    if (image?.public_url) return image.public_url;

    const baseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    if (!baseUrl || !image?.storage_key) return '';
    return `${baseUrl}/${image.storage_key.replace(/^\//, '')}`;
  }

  async function getProductDetail(slug) {
    if (!hasSupabaseConfig() || !slug) return null;

    const products = await fetchJson(
      `products?select=id,category_id,name,slug,description,price,collection,material,size,care_guide,return_policy,status,created_at&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
    );
    const product = products[0];
    if (!product) return null;

    const [images, relations] = await Promise.all([
      fetchJson(`product_images?select=id,product_id,storage_key,public_url,alt,is_primary,sort_order&product_id=eq.${product.id}&order=sort_order.asc`),
      fetchJson(`product_categories?select=product_id,category_id&product_id=eq.${product.id}`),
    ]);

    const categoryIds = [...new Set([
      product.category_id,
      ...relations.map((relation) => relation.category_id),
    ].filter(Boolean))];
    const categories = categoryIds.length
      ? await fetchJson(`categories?select=id,name,slug,parent_id,sort_order&is_active=eq.true&id=in.(${categoryIds.join(',')})&order=sort_order.asc`)
      : [];

    const gallery = images.map((image) => ({
      id: image.id,
      src: buildAssetUrl(image),
      alt: image.alt || product.name,
      is_primary: image.is_primary,
      storage_key: image.storage_key,
    }));

    return {
      ...product,
      categories,
      images: gallery,
      primaryImage: gallery.find((image) => image.is_primary) || gallery[0] || null,
    };
  }

  window.ProductService = {
    getProductDetail,
  };
})();
