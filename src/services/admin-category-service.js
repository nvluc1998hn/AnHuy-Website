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

  async function getCategories() {
    return fetchJson('categories?select=id,name,slug,parent_id,sort_order,is_active,created_at,updated_at&order=sort_order.asc');
  }

  async function saveCategory(form) {
    const body = {
      name: form.name,
      slug: form.slug,
      parent_id: form.parent_id || null,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`categories?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('categories', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function deleteCategory(categoryId) {
    const deletedRows = await fetchJson(`categories?id=eq.${categoryId}&select=id,name,slug`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) {
      throw new Error('Không xóa được danh mục. Kiểm tra lại quyền admin/editor hoặc policy RLS.');
    }

    return deletedRows[0];
  }

  window.AdminCategoryService = {
    deleteCategory,
    getCategories,
    saveCategory,
  };
})();
