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

  function buildAssetUrl(storageKey) {
    if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !storageKey) return '';
    return `${baseUrl}/${storageKey.replace(/^\//, '')}`;
  }

  function getProductImage(productId, images) {
    const productImages = images.filter((image) => image.product_id === productId);
    return productImages.find((image) => image.is_primary) || productImages[0] || null;
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString('vi-VN') + 'đ';
  }

  async function getFeaturedSection(code = 'best-seller') {
    if (!hasSupabaseConfig()) return null;

    const codeAliasesByCode = {
      'best-seller': ['best-seller', 'bestsale', 'best-sale', 'best_seller'],
      'top-picks': ['top-picks', 'toppicks', 'top-pic', 'top-pick', 'top_picks'],
    };
    const codeAliases = codeAliasesByCode[code] || [code];
    const sections = await fetchJson(
      `featured_sections?select=id,code,title,description,sort_order,is_active&code=in.(${codeAliases.map(encodeURIComponent).join(',')})&is_active=eq.true&order=sort_order.asc&limit=1`,
    );
    const section = sections[0];
    if (!section) return null;

    const items = await fetchJson(
      `featured_section_items?select=id,section_id,product_id,label,subtitle,image_storage_key,hover_image_storage_key,sort_order,is_active&section_id=eq.${section.id}&is_active=eq.true&order=sort_order.asc`,
    );
    const productIds = [...new Set(items.map((item) => item.product_id).filter(Boolean))];
    const [products, images] = productIds.length
      ? await Promise.all([
          fetchJson(`products?select=id,name,slug,description,price,collection,material,size,status&status=eq.published&id=in.(${productIds.join(',')})`),
          fetchJson(`product_images?select=product_id,storage_key,public_url,alt,is_primary,sort_order&product_id=in.(${productIds.join(',')})&order=sort_order.asc`),
        ])
      : [[], []];
    const productById = products.reduce((result, product) => ({ ...result, [product.id]: product }), {});

    return {
      ...section,
      items: items.map((item) => {
        const product = productById[item.product_id] || {};
        const productImage = getProductImage(item.product_id, images);
        const productImageUrl = productImage?.public_url || buildAssetUrl(productImage?.storage_key);
        const itemImageUrl = buildAssetUrl(item.image_storage_key);
        const hoverImageUrl = buildAssetUrl(item.hover_image_storage_key);
        const image = itemImageUrl || productImageUrl;

        return {
          id: item.id,
          label: item.label || product.name || 'Sản phẩm',
          subtitle: item.subtitle || '',
          name: item.label || product.name || 'Sản phẩm',
          slug: product.slug || '',
          price: product.price !== undefined ? formatCurrency(product.price) : '',
          image,
          image_url: image,
          public_url: image,
          product_image_url: productImageUrl,
          hover_image: hoverImageUrl,
          hover_image_url: hoverImageUrl,
          collection: item.subtitle || product.collection || '',
          material: product.material || '',
          size: product.size || '',
          description: product.description || item.subtitle || '',
        };
      }),
    };
  }

  window.FeaturedService = {
    getFeaturedSection,
  };
})();
