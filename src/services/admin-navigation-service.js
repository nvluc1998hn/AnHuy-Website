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

  function buildImageUrl(group) {
    if (!group?.image_storage_key) return '';
    if (/^https?:\/\//i.test(group.image_storage_key)) return group.image_storage_key;

    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;

    return baseUrl ? `${baseUrl}/${group.image_storage_key.replace(/^\//, '')}` : '';
  }

  async function getGroups() {
    const groups = await fetchJson(
      'navigation_groups?select=id,title,slug,image_storage_provider,image_storage_bucket,image_storage_key,sort_order,is_active,created_at,updated_at&order=sort_order.asc',
    );

    return (groups || []).map((group) => ({
      ...group,
      image_url: buildImageUrl(group),
    }));
  }

  async function getCategories() {
    return fetchJson('categories?select=id,name,slug,parent_id,sort_order,is_active&order=sort_order.asc');
  }

  async function getPages() {
    return fetchJson('content_pages?select=id,title,slug,status&order=title.asc');
  }

  async function getItems() {
    let items = [];

    try {
      items = await fetchJson(
        'navigation_items?select=id,group_id,label,item_type,href,category_id,page_id,image_storage_provider,image_storage_bucket,image_storage_key,is_heading,sort_order,is_active,created_at,updated_at&order=sort_order.asc',
      );
    } catch (error) {
      console.warn('navigation_items image columns are not available yet, using fallback query.', error);
      items = await fetchJson(
        'navigation_items?select=id,group_id,label,item_type,href,category_id,page_id,is_heading,sort_order,is_active,created_at,updated_at&order=sort_order.asc',
      );
    }

    return (items || []).map((item) => ({
      ...item,
      image_url: buildImageUrl(item),
    }));
  }

  async function saveGroup(form) {
    const body = {
      title: form.title,
      slug: form.slug,
      image_storage_provider: 'cloudflare_r2',
      image_storage_bucket: form.image_storage_bucket || 'anhuy-image',
      image_storage_key: form.image_storage_key || null,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`navigation_groups?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('navigation_groups', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function deleteGroup(groupId) {
    const deletedRows = await fetchJson(`navigation_groups?id=eq.${groupId}&select=id,title,slug`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) {
      throw new Error('Không xóa được nhóm menu. Kiểm tra lại quyền admin/editor hoặc policy RLS.');
    }

    return deletedRows[0];
  }

  async function saveItem(form) {
    const body = {
      group_id: form.group_id || null,
      label: form.label,
      item_type: form.item_type || 'link',
      href: form.href || null,
      category_id: form.item_type === 'category' ? form.category_id || null : null,
      page_id: form.item_type === 'page' ? form.page_id || null : null,
      image_storage_provider: 'cloudflare_r2',
      image_storage_bucket: form.image_storage_bucket || 'anhuy-image',
      image_storage_key: form.image_storage_key || null,
      is_heading: Boolean(form.is_heading),
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`navigation_items?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('navigation_items', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function deleteItem(itemId) {
    const deletedRows = await fetchJson(`navigation_items?id=eq.${itemId}&select=id,label`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) {
      throw new Error('Không xóa được menu item. Kiểm tra lại quyền admin/editor hoặc policy RLS.');
    }

    return deletedRows[0];
  }

  window.AdminNavigationService = {
    deleteGroup,
    deleteItem,
    getCategories,
    getGroups,
    getItems,
    getPages,
    saveItem,
    saveGroup,
  };
})();
