(function () {
  function getBaseUrl() {
    return window.AppConfig.supabaseUrl.replace(/\/$/, '');
  }

  function getHeaders(extra = {}) {
    return {
      apikey: window.AppConfig.supabasePublishableKey,
      Authorization: `Bearer ${window.AuthService.getAccessToken()}`,
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

  function buildAssetUrl(storageKey) {
    if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !storageKey) return '';
    return `${baseUrl}/${storageKey.replace(/^\//, '')}`;
  }

  function getImageUrl(image) {
    if (!image) return '';
    if (image.public_url) return image.public_url;
    return buildAssetUrl(image.storage_key);
  }

  async function getSections() {
    return fetchJson('featured_sections?select=id,code,title,description,sort_order,is_active,created_at,updated_at&order=sort_order.asc');
  }

  async function getItems() {
    const items = await fetchJson('featured_section_items?select=id,section_id,product_id,label,subtitle,image_storage_key,hover_image_storage_key,sort_order,is_active,created_at,updated_at&order=sort_order.asc');
    const productIds = [...new Set((items || []).map((item) => item.product_id).filter(Boolean))];
    const productImages = productIds.length
      ? await fetchJson(`product_images?select=product_id,storage_key,public_url,is_primary,sort_order&product_id=in.(${productIds.join(',')})&order=sort_order.asc`)
      : [];
    const primaryImageByProductId = productImages.reduce((result, image) => {
      if (!result[image.product_id] || image.is_primary) {
        result[image.product_id] = image;
      }
      return result;
    }, {});

    return (items || []).map((item) => ({
      ...item,
      image_url: item.image_storage_key
        ? buildAssetUrl(item.image_storage_key)
        : getImageUrl(primaryImageByProductId[item.product_id]),
      hover_image_url: buildAssetUrl(item.hover_image_storage_key),
    }));
  }

  async function getProducts() {
    return fetchJson('products?select=id,name,slug,status,price&order=created_at.desc');
  }

  async function saveSection(form) {
    const body = {
      code: form.code,
      title: form.title,
      description: form.description || null,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`featured_sections?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('featured_sections', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function saveItem(form) {
    const body = {
      section_id: form.section_id,
      product_id: form.product_id || null,
      label: form.label || null,
      subtitle: form.subtitle || null,
      image_storage_provider: 'cloudflare_r2',
      image_storage_bucket: form.image_storage_bucket || 'anhuy-image',
      image_storage_key: form.image_storage_key || null,
      hover_image_storage_provider: 'cloudflare_r2',
      hover_image_storage_bucket: form.hover_image_storage_bucket || 'anhuy-image',
      hover_image_storage_key: form.hover_image_storage_key || null,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`featured_section_items?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('featured_section_items', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function deleteSection(sectionId) {
    const deletedRows = await fetchJson(`featured_sections?id=eq.${sectionId}&select=id,title`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) throw new Error('Không xóa được section.');
    return deletedRows[0];
  }

  async function deleteItem(itemId) {
    const deletedRows = await fetchJson(`featured_section_items?id=eq.${itemId}&select=id,label`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) throw new Error('Không xóa được item.');
    return deletedRows[0];
  }

  window.AdminFeaturedService = {
    deleteItem,
    deleteSection,
    getItems,
    getProducts,
    getSections,
    saveItem,
    saveSection,
  };
})();
