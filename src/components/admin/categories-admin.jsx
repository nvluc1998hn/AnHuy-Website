(function () {
const { useEffect: categoryUseEffect, useMemo: categoryUseMemo, useState: categoryUseState } = React;

const emptyCategoryForm = {
  id: '',
  name: '',
  slug: '',
  parent_id: '',
  sort_order: 0,
  is_active: true,
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildForm(category) {
  return {
    ...emptyCategoryForm,
    id: category.id,
    name: category.name || '',
    slug: category.slug || '',
    parent_id: category.parent_id || '',
    sort_order: category.sort_order || 0,
    is_active: Boolean(category.is_active),
  };
}

function getDescendantIds(categoryId, categories) {
  const children = categories.filter((category) => category.parent_id === categoryId);
  return children.reduce((result, child) => {
    return [...result, child.id, ...getDescendantIds(child.id, categories)];
  }, []);
}

function CategoriesAdmin() {
  const [session, setSession] = categoryUseState(() => window.AuthService.getSession());
  const [categories, setCategories] = categoryUseState([]);
  const [form, setForm] = categoryUseState(emptyCategoryForm);
  const [query, setQuery] = categoryUseState('');
  const [loading, setLoading] = categoryUseState(false);
  const [saving, setSaving] = categoryUseState(false);
  const [toast, setToast] = categoryUseState(null);

  function showToast(text, type = 'success') {
    setToast({ text, type });
  }

  async function loadCategories({ silent = false } = {}) {
    if (!window.AuthService.getSession()) return;
    setLoading(true);
    if (!silent) setToast(null);

    try {
      setCategories(await window.AdminCategoryService.getCategories());
    } catch (error) {
      showToast(error.message || 'Không tải được danh mục.', 'error');
    } finally {
      setLoading(false);
    }
  }

  categoryUseEffect(() => {
    if (session) loadCategories();
  }, [session]);

  categoryUseEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const categoryNameById = categoryUseMemo(() => {
    return categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  }, [categories]);

  const disabledParentIds = categoryUseMemo(() => {
    return form.id ? [form.id, ...getDescendantIds(form.id, categories)] : [];
  }, [categories, form.id]);

  const filteredCategories = categoryUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return categories;

    return categories.filter((category) => (
      category.name?.toLowerCase().includes(keyword)
      || category.slug?.toLowerCase().includes(keyword)
      || categoryNameById[category.parent_id]?.toLowerCase().includes(keyword)
    ));
  }, [categories, categoryNameById, query]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      slug: name === 'name' && !current.id ? slugify(value) : current.slug,
    }));
  }

  function resetForm() {
    setForm(emptyCategoryForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminCategoryService.saveCategory(form);
      showToast(form.id ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục.');
      resetForm();
      await loadCategories({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được danh mục.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(`Xóa danh mục "${category.name}"? Danh mục con sẽ được bỏ gán cha, liên kết sản phẩm có thể bị ảnh hưởng.`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminCategoryService.deleteCategory(category.id);
      if (form.id === category.id) resetForm();
      showToast('Đã xóa danh mục.');
      await loadCategories({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được danh mục.', 'error');
    }
  }

  function signOut() {
    window.AuthService.signOut();
    setSession(null);
    setCategories([]);
    resetForm();
  }

  if (!session) {
    return <window.AdminLogin onLogin={setSession} />;
  }

  return (
    <section className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <span>Category CMS</span>
          <h1>Quản lý danh mục</h1>
        </div>
        <div className="admin-head-actions">
          <a href="#admin/products">Sản phẩm</a>
          <a href="#admin/featured">Featured</a>
          <a href="#admin/partners">Đối tác</a>
          <a href="#admin/navigation-groups">Nhóm menu</a>
          <button type="button" onClick={() => loadCategories()}>Tải lại</button>
          <button type="button" onClick={signOut}>Đăng xuất</button>
        </div>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          <span>{toast.type === 'error' ? 'Lỗi' : 'Thành công'}</span>
          <p>{toast.text}</p>
          <button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <div className="admin-products-layout admin-categories-layout">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-title">
            <h2>{form.id ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            {form.id && <button type="button" onClick={resetForm}>Tạo mới</button>}
          </div>

          <label>
            Tên danh mục
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>

          <label>
            Slug
            <input value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} required />
          </label>

          <label>
            Danh mục cha
            <select value={form.parent_id} onChange={(event) => updateField('parent_id', event.target.value)}>
              <option value="">Không có danh mục cha</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} disabled={disabledParentIds.includes(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-grid">
            <label>
              Thứ tự
              <input type="number" value={form.sort_order} onChange={(event) => updateField('sort_order', event.target.value)} />
            </label>
            <label className="admin-checkbox">
              <input type="checkbox" checked={form.is_active} onChange={(event) => updateField('is_active', event.target.checked)} />
              Đang hiển thị
            </label>
          </div>

          <button className="admin-submit" type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : form.id ? 'Cập nhật danh mục' : 'Thêm danh mục'}
          </button>
        </form>

        <div className="admin-products-list">
          <div className="admin-list-toolbar">
            <strong>{loading ? 'Đang tải...' : `${filteredCategories.length} danh mục`}</strong>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, slug, danh mục cha" />
          </div>

          <div className="admin-product-table">
            {filteredCategories.map((category) => (
              <article className="admin-product-row admin-category-row" key={category.id}>
                <div className="admin-nav-type">
                  <span>CAT</span>
                </div>
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.slug}</p>
                  <small>{category.parent_id ? `Cha: ${categoryNameById[category.parent_id] || 'Không rõ'}` : 'Danh mục gốc'}</small>
                </div>
                <strong>{category.is_active ? 'active' : 'inactive'} · sort {category.sort_order || 0}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => setForm(buildForm(category))}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleDelete(category)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.CategoriesAdmin = CategoriesAdmin;
})();
