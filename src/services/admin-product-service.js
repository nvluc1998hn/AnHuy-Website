(function () {
  function getBaseUrl() {
    return window.AppConfig.supabaseUrl.replace(/\/$/, '');
  }

  function getHeaders(extra = {}) {
    const token = window.AuthService.getAccessToken();
    return {
      apikey: window.AppConfig.supabasePublishableKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${getBaseUrl()}/rest/v1/${path}`, {
      ...options,
      headers: getHeaders(options.headers),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Supabase request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function getImageUrl(image) {
    if (!image?.public_url && !image?.storage_key) return '';
    if (image.public_url) return image.public_url;

    const baseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    return baseUrl ? `${baseUrl}/${image.storage_key.replace(/^\//, '')}` : '';
  }

  function normalizeProduct(product, relations, images) {
    const productRelations = relations.filter((relation) => relation.product_id === product.id);
    const productImages = images.filter((image) => image.product_id === product.id);
    const primaryImage = productImages.find((image) => image.is_primary) || productImages[0] || null;

    return {
      ...product,
      category_ids: productRelations.map((relation) => relation.category_id),
      images: productImages.map((image) => ({
        ...image,
        image_url: getImageUrl(image),
      })),
      primary_image: primaryImage,
      image_url: getImageUrl(primaryImage),
    };
  }

  async function getCategories() {
    return fetchJson('categories?select=id,name,slug,parent_id,sort_order,is_active&is_active=eq.true&order=sort_order.asc');
  }

  async function getProducts() {
    const products = await fetchJson(
      'products?select=id,category_id,name,slug,description,price,collection,material,size,status,is_featured,sort_order,created_at,updated_at&order=created_at.desc',
    );

    if (!products.length) return [];

    const ids = products.map((product) => product.id).join(',');
    const [relations, images] = await Promise.all([
      fetchJson(`product_categories?select=product_id,category_id&product_id=in.(${ids})`),
      fetchJson(`product_images?select=id,product_id,storage_key,public_url,alt,is_primary,sort_order&product_id=in.(${ids})&order=sort_order.asc`),
    ]);

    return products.map((product) => normalizeProduct(product, relations, images));
  }

  async function saveProduct(form) {
    const productBody = {
      category_id: form.category_id || null,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: Number(form.price || 0),
      collection: form.collection || null,
      material: form.material || null,
      size: form.size || null,
      status: form.status || 'draft',
      is_featured: Boolean(form.is_featured),
      sort_order: Number(form.sort_order || 0),
    };

    const product = form.id
      ? (await fetchJson(`products?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(productBody),
        }))[0]
      : (await fetchJson('products', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(productBody),
        }))[0];

    const categoryIds = [...new Set([form.category_id, ...(form.category_ids || [])].filter(Boolean))];
    await fetchJson(`product_categories?product_id=eq.${product.id}`, { method: 'DELETE' });

    if (categoryIds.length) {
      await fetchJson('product_categories', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(categoryIds.map((categoryId) => ({
          product_id: product.id,
          category_id: categoryId,
        }))),
      });
    }

    const newImages = (form.images || []).filter((image) => !image.id && (image.storage_key || image.public_url));
    if (newImages.length) {
      if (newImages.some((image) => image.is_primary)) {
        await fetchJson(`product_images?product_id=eq.${product.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ is_primary: false }),
        });
      }

      await fetchJson('product_images', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(newImages.map((image, index) => ({
          product_id: product.id,
          storage_provider: 'cloudflare_r2',
          storage_bucket: 'anhuy-assets',
          storage_key: image.storage_key || `external/${product.slug}-${Date.now()}-${index}`,
          public_url: image.public_url || null,
          alt: image.alt || form.image_alt || product.name,
          is_primary: Boolean(image.is_primary),
          sort_order: Number(image.sort_order || (index + 1) * 10),
        }))),
      });
    }

    return product;
  }

  async function addProductImages(productId, images) {
    if (!productId || !images?.length) return;

    await fetchJson('product_images', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(images.map((image, index) => ({
        product_id: productId,
        storage_provider: 'cloudflare_r2',
        storage_bucket: 'anhuy-assets',
        storage_key: image.storage_key,
        public_url: image.public_url || null,
        alt: image.alt || '',
        is_primary: Boolean(image.is_primary),
        sort_order: Number(image.sort_order || (index + 1) * 10),
      }))),
    });
  }

  async function deleteProductImage(image) {
    if (image.storage_key) {
      const response = await fetch('/api/r2-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.AuthService.getAccessToken()}`,
        },
        body: JSON.stringify({ storage_key: image.storage_key }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Không xóa được ảnh trên Cloudflare.');
      }
    }

    if (image.id) {
      await fetchJson(`product_images?id=eq.${image.id}`, { method: 'DELETE' });
    }
  }

  async function setPrimaryImage(productId, imageId) {
    await fetchJson(`product_images?product_id=eq.${productId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ is_primary: false }),
    });
    await fetchJson(`product_images?id=eq.${imageId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ is_primary: true }),
    });
  }

  async function deleteProduct(productId) {
    await fetchJson(`products?id=eq.${productId}`, { method: 'DELETE' });
  }

  window.AdminProductService = {
    addProductImages,
    deleteProduct,
    deleteProductImage,
    getCategories,
    getProducts,
    saveProduct,
    setPrimaryImage,
  };
})();
