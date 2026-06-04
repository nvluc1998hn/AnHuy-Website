(function () {
const { useEffect: navUseEffect, useMemo: navUseMemo, useState: navUseState } = React;

const emptyGroupForm = {
  id: '',
  title: '',
  slug: '',
  image_storage_bucket: 'anhuy-image',
  image_storage_key: '',
  sort_order: 0,
  is_active: true,
};

const emptyItemForm = {
  id: '',
  group_id: '',
  label: '',
  item_type: 'link',
  href: '#',
  category_id: '',
  page_id: '',
  image_storage_bucket: 'anhuy-image',
  image_storage_key: '',
  is_heading: false,
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

function buildGroupForm(group) {
  return {
    ...emptyGroupForm,
    id: group.id,
    title: group.title || '',
    slug: group.slug || '',
    image_storage_bucket: group.image_storage_bucket || 'anhuy-image',
    image_storage_key: group.image_storage_key || '',
    sort_order: group.sort_order || 0,
    is_active: Boolean(group.is_active),
  };
}

function buildItemForm(item) {
  return {
    ...emptyItemForm,
    id: item.id,
    group_id: item.group_id || '',
    label: item.label || '',
    item_type: item.item_type || 'link',
    href: item.href || '',
    category_id: item.category_id || '',
    page_id: item.page_id || '',
    image_storage_bucket: item.image_storage_bucket || 'anhuy-image',
    image_storage_key: item.image_storage_key || '',
    is_heading: Boolean(item.is_heading),
    sort_order: item.sort_order || 0,
    is_active: Boolean(item.is_active),
  };
}

function buildStorageImageUrl(storageKey) {
  if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
  const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
  const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
  const baseUrl = publicBaseUrl || cdnBaseUrl;
  return baseUrl && storageKey ? `${baseUrl}/${storageKey.replace(/^\//, '')}` : '';
}

function getCategoryHref(categoryId, categories) {
  const category = categories.find((item) => item.id === categoryId);
  return category ? `#category/${category.slug}` : '#';
}

function getPageHref(pageId, pages) {
  const page = pages.find((item) => item.id === pageId);
  return page ? `#${page.slug}` : '#';
}

function NavigationGroupsAdmin({ initialPanel = 'groups' }) {
  const [session, setSession] = navUseState(() => window.AuthService.getSession());
  const [activePanel, setActivePanel] = navUseState(initialPanel);
  const [groups, setGroups] = navUseState([]);
  const [items, setItems] = navUseState([]);
  const [categories, setCategories] = navUseState([]);
  const [pages, setPages] = navUseState([]);
  const [groupForm, setGroupForm] = navUseState(emptyGroupForm);
  const [itemForm, setItemForm] = navUseState(emptyItemForm);
  const [query, setQuery] = navUseState('');
  const [loading, setLoading] = navUseState(false);
  const [saving, setSaving] = navUseState(false);
  const [uploading, setUploading] = navUseState(false);
  const [toast, setToast] = navUseState(null);

  function showToast(text, type = 'success') {
    setToast({ text, type });
  }

  async function loadData({ silent = false } = {}) {
    if (!window.AuthService.getSession()) return;
    setLoading(true);
    if (!silent) setToast(null);

    try {
      const [nextGroups, nextItems, nextCategories, nextPages] = await Promise.all([
        window.AdminNavigationService.getGroups(),
        window.AdminNavigationService.getItems(),
        window.AdminNavigationService.getCategories(),
        window.AdminNavigationService.getPages(),
      ]);
      setGroups(nextGroups);
      setItems(nextItems || []);
      setCategories(nextCategories || []);
      setPages(nextPages || []);
    } catch (error) {
      showToast(error.message || 'Không tải được dữ liệu navigation.', 'error');
    } finally {
      setLoading(false);
    }
  }

  navUseEffect(() => {
    if (session) loadData();
  }, [session]);

  navUseEffect(() => {
    setActivePanel(initialPanel);
  }, [initialPanel]);

  navUseEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const groupNameById = navUseMemo(() => {
    return groups.reduce((map, group) => ({ ...map, [group.id]: group.title }), {});
  }, [groups]);

  const categoryNameById = navUseMemo(() => {
    return categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  }, [categories]);

  const pageNameById = navUseMemo(() => {
    return pages.reduce((map, page) => ({ ...map, [page.id]: page.title }), {});
  }, [pages]);

  const filteredGroups = navUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword || activePanel !== 'groups') return groups;

    return groups.filter((group) => (
      group.title?.toLowerCase().includes(keyword)
      || group.slug?.toLowerCase().includes(keyword)
    ));
  }, [activePanel, groups, query]);

  const filteredItems = navUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword || activePanel !== 'items') return items;

    return items.filter((item) => (
      item.label?.toLowerCase().includes(keyword)
      || item.href?.toLowerCase().includes(keyword)
      || item.image_storage_key?.toLowerCase().includes(keyword)
      || groupNameById[item.group_id]?.toLowerCase().includes(keyword)
    ));
  }, [activePanel, groupNameById, items, query]);

  function updateGroupField(name, value) {
    setGroupForm((current) => ({
      ...current,
      [name]: value,
      slug: name === 'title' && !current.id ? slugify(value) : current.slug,
    }));
  }

  function updateItemField(name, value) {
    setItemForm((current) => {
      const next = { ...current, [name]: value };

      if (name === 'item_type') {
        next.category_id = value === 'category' ? current.category_id : '';
        next.page_id = value === 'page' ? current.page_id : '';
        next.href = value === 'link' ? current.href || '#' : '#';
      }

      if (name === 'category_id') {
        const category = categories.find((item) => item.id === value);
        next.href = getCategoryHref(value, categories);
        if (!current.id && category && !current.label) next.label = category.name;
      }

      if (name === 'page_id') {
        const page = pages.find((item) => item.id === value);
        next.href = getPageHref(value, pages);
        if (!current.id && page && !current.label) next.label = page.title;
      }

      return next;
    });
  }

  function resetGroupForm() {
    setGroupForm(emptyGroupForm);
  }

  function resetItemForm() {
    setItemForm(emptyItemForm);
  }

  async function handleGroupSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminNavigationService.saveGroup(groupForm);
      showToast(groupForm.id ? 'Đã cập nhật nhóm menu.' : 'Đã tạo nhóm menu.');
      resetGroupForm();
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được nhóm menu.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleItemSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminNavigationService.saveItem(itemForm);
      showToast(itemForm.id ? 'Đã cập nhật menu item.' : 'Đã tạo menu item.');
      resetItemForm();
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được menu item.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleGroupDelete(group) {
    const confirmed = window.confirm(`Xóa nhóm menu "${group.title}"? Các navigation_items thuộc nhóm này cũng sẽ bị xóa.`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminNavigationService.deleteGroup(group.id);
      if (groupForm.id === group.id) resetGroupForm();
      if (itemForm.group_id === group.id) resetItemForm();
      showToast('Đã xóa nhóm menu.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được nhóm menu.', 'error');
    }
  }

  async function handleItemDelete(item) {
    const confirmed = window.confirm(`Xóa menu item "${item.label}"?`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminNavigationService.deleteItem(item.id);
      if (itemForm.id === item.id) resetItemForm();
      showToast('Đã xóa menu item.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được menu item.', 'error');
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setToast(null);

    try {
      const folder = groupForm.slug ? `navigation-groups/${groupForm.slug}` : 'navigation-groups';
      const result = await window.R2UploadService.uploadImage(file, folder);
      setGroupForm((current) => ({
        ...current,
        image_storage_key: result.storage_key,
        image_storage_bucket: result.bucket || current.image_storage_bucket,
      }));
      showToast(result.optimized ? `Đã nén và upload ảnh (${result.size_label}).` : 'Đã upload ảnh nhóm menu.');
    } catch (error) {
      showToast(error.message || 'Không upload được ảnh.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleItemImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setToast(null);

    try {
      const folder = itemForm.label ? `navigation-items/${slugify(itemForm.label)}` : 'navigation-items';
      const result = await window.R2UploadService.uploadImage(file, folder);
      setItemForm((current) => ({
        ...current,
        image_storage_key: result.storage_key,
        image_storage_bucket: result.bucket || current.image_storage_bucket,
      }));
      showToast(result.optimized ? `Đã nén và upload ảnh item (${result.size_label}).` : 'Đã upload ảnh item.');
    } catch (error) {
      showToast(error.message || 'Không upload được ảnh item.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  function switchPanel(panel) {
    setActivePanel(panel);
    setQuery('');
    window.history.replaceState(null, '', panel === 'items' ? '#admin/navigation-items' : '#admin/navigation-groups');
  }

  function signOut() {
    window.AuthService.signOut();
    setSession(null);
    setGroups([]);
    setItems([]);
    setCategories([]);
    setPages([]);
    resetGroupForm();
    resetItemForm();
  }

  if (!session) {
    return <window.AdminLogin onLogin={setSession} />;
  }

  const isGroupPanel = activePanel === 'groups';
  const itemPreviewUrl = buildStorageImageUrl(itemForm.image_storage_key);

  return (
    <section className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <span>Navigation CMS</span>
          <h1>{isGroupPanel ? 'Quản lý nhóm menu' : 'Quản lý menu item'}</h1>
        </div>
        <div className="admin-head-actions">
          <a href="#admin/products">Sản phẩm</a>
          <a href="#admin/featured">Featured</a>
          <a href="#admin/categories">Danh mục</a>
          <a href="#admin/partners">Đối tác</a>
          <button type="button" onClick={() => loadData()}>Tải lại</button>
          <button type="button" onClick={signOut}>Đăng xuất</button>
        </div>
      </div>

      <div className="admin-panel-tabs">
        <button className={isGroupPanel ? 'active' : ''} type="button" onClick={() => switchPanel('groups')}>
          Nhóm menu
        </button>
        <button className={!isGroupPanel ? 'active' : ''} type="button" onClick={() => switchPanel('items')}>
          Menu item
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          <span>{toast.type === 'error' ? 'Lỗi' : 'Thành công'}</span>
          <p>{toast.text}</p>
          <button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <div className="admin-products-layout admin-navigation-layout">
        {isGroupPanel ? (
          <form className="admin-product-form" onSubmit={handleGroupSubmit}>
            <div className="admin-form-title">
              <h2>{groupForm.id ? 'Sửa nhóm menu' : 'Thêm nhóm menu'}</h2>
              {groupForm.id && <button type="button" onClick={resetGroupForm}>Tạo mới</button>}
            </div>

            <label>
              Tiêu đề
              <input value={groupForm.title} onChange={(event) => updateGroupField('title', event.target.value)} required />
            </label>

            <label>
              Slug
              <input value={groupForm.slug} onChange={(event) => updateGroupField('slug', slugify(event.target.value))} required />
            </label>

            <div className="admin-form-grid">
              <label>
                Thứ tự
                <input type="number" value={groupForm.sort_order} onChange={(event) => updateGroupField('sort_order', event.target.value)} />
              </label>
              <label>
                Bucket ảnh
                <input value={groupForm.image_storage_bucket} onChange={(event) => updateGroupField('image_storage_bucket', event.target.value)} />
              </label>
            </div>

            <label>
              R2 storage key
              <input value={groupForm.image_storage_key} onChange={(event) => updateGroupField('image_storage_key', event.target.value)} placeholder="navigation-groups/menu.webp" />
            </label>

            <label className="admin-upload-box">
              Upload ảnh nhóm menu
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <span>{uploading ? 'Đang upload...' : 'Chọn ảnh từ máy của bạn'}</span>
            </label>

            <label className="admin-checkbox">
              <input type="checkbox" checked={groupForm.is_active} onChange={(event) => updateGroupField('is_active', event.target.checked)} />
              Đang hiển thị
            </label>

            <button className="admin-submit" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : groupForm.id ? 'Cập nhật nhóm menu' : 'Thêm nhóm menu'}
            </button>
          </form>
        ) : (
          <form className="admin-product-form" onSubmit={handleItemSubmit}>
            <div className="admin-form-title">
              <h2>{itemForm.id ? 'Sửa menu item' : 'Thêm menu item'}</h2>
              {itemForm.id && <button type="button" onClick={resetItemForm}>Tạo mới</button>}
            </div>

            <label>
              Nhóm menu
              <select value={itemForm.group_id} onChange={(event) => updateItemField('group_id', event.target.value)} required>
                <option value="">Chọn nhóm menu</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.title}</option>
                ))}
              </select>
            </label>

            <label>
              Tên hiển thị
              <input value={itemForm.label} onChange={(event) => updateItemField('label', event.target.value)} required />
            </label>

            <div className="admin-form-grid">
              <label>
                Loại item
                <select value={itemForm.item_type} onChange={(event) => updateItemField('item_type', event.target.value)}>
                  <option value="link">Link thường</option>
                  <option value="category">Danh mục</option>
                  <option value="page">Trang nội dung</option>
                </select>
              </label>
              <label>
                Thứ tự
                <input type="number" value={itemForm.sort_order} onChange={(event) => updateItemField('sort_order', event.target.value)} />
              </label>
            </div>

            {itemForm.item_type === 'category' && (
              <label>
                Danh mục
                <select value={itemForm.category_id} onChange={(event) => updateItemField('category_id', event.target.value)} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
            )}

            {itemForm.item_type === 'page' && (
              <label>
                Trang nội dung
                <select value={itemForm.page_id} onChange={(event) => updateItemField('page_id', event.target.value)} required>
                  <option value="">Chọn trang</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.id}>{page.title}</option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Href
              <input value={itemForm.href} onChange={(event) => updateItemField('href', event.target.value)} placeholder="#category/khay" />
            </label>

            <div className={`admin-partner-preview ${itemPreviewUrl ? '' : 'empty'}`}>
              {itemPreviewUrl ? <img src={itemPreviewUrl} alt={itemForm.label || 'Ảnh menu item'} /> : <span>ẢNH ITEM</span>}
            </div>

            <label>
              Ảnh item storage key
              <input value={itemForm.image_storage_key} onChange={(event) => updateItemField('image_storage_key', event.target.value)} placeholder="navigation-items/niem-dam-me.webp" />
            </label>

            <label className="admin-upload-box">
              Upload ảnh item
              <input type="file" accept="image/*" onChange={handleItemImageUpload} disabled={uploading} />
              <span>{uploading ? 'Đang upload...' : 'Chọn ảnh item'}</span>
            </label>

            <div className="admin-form-grid">
              <label className="admin-checkbox">
                <input type="checkbox" checked={itemForm.is_heading} onChange={(event) => updateItemField('is_heading', event.target.checked)} />
                Là heading
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={itemForm.is_active} onChange={(event) => updateItemField('is_active', event.target.checked)} />
                Đang hiển thị
              </label>
            </div>

            <button className="admin-submit" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : itemForm.id ? 'Cập nhật menu item' : 'Thêm menu item'}
            </button>
          </form>
        )}

        <div className="admin-products-list">
          <div className="admin-list-toolbar">
            <strong>
              {loading ? 'Đang tải...' : isGroupPanel ? `${filteredGroups.length} nhóm menu` : `${filteredItems.length} menu item`}
            </strong>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isGroupPanel ? 'Tìm theo tiêu đề, slug' : 'Tìm theo tên, href, nhóm'}
            />
          </div>

          <div className="admin-product-table">
            {isGroupPanel ? filteredGroups.map((group) => (
              <article className="admin-product-row admin-navigation-row" key={group.id}>
                <div className={`admin-product-thumb ${group.image_url ? '' : 'empty'}`}>
                  {group.image_url ? <img src={group.image_url} alt={group.title} loading="lazy" /> : <span>NV</span>}
                </div>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.slug}</p>
                  <small>{group.is_active ? 'active' : 'inactive'} · sort {group.sort_order || 0}</small>
                </div>
                <strong>{group.image_storage_key ? 'Có ảnh' : 'Chưa ảnh'}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => setGroupForm(buildGroupForm(group))}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleGroupDelete(group)}>Xóa</button>
                </div>
              </article>
            )) : filteredItems.map((item) => (
              <article className="admin-product-row admin-navigation-row admin-navigation-item-row" key={item.id}>
                <div className={`admin-product-thumb ${item.image_url ? '' : 'empty'}`}>
                  {item.image_url ? <img src={item.image_url} alt={item.label} loading="lazy" /> : <span>{item.item_type}</span>}
                </div>
                <div>
                  <h3>{item.label}</h3>
                  <p>{groupNameById[item.group_id] || 'Chưa gán nhóm'}</p>
                  <small>
                    {item.item_type === 'category' && categoryNameById[item.category_id] ? categoryNameById[item.category_id] : ''}
                    {item.item_type === 'page' && pageNameById[item.page_id] ? pageNameById[item.page_id] : ''}
                    {item.href ? ` ${item.href}` : ''}
                  </small>
                </div>
                <strong>{item.is_active ? 'active' : 'inactive'} · sort {item.sort_order || 0}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => setItemForm(buildItemForm(item))}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleItemDelete(item)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.NavigationGroupsAdmin = NavigationGroupsAdmin;
})();
