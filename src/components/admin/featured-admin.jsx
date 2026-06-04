(function () {
const { useEffect: featuredUseEffect, useMemo: featuredUseMemo, useState: featuredUseState } = React;

const emptySectionForm = {
  id: '',
  code: 'best-seller',
  title: '',
  description: '',
  sort_order: 0,
  is_active: true,
};

const emptyItemForm = {
  id: '',
  section_id: '',
  product_id: '',
  label: '',
  subtitle: '',
  image_storage_bucket: 'anhuy-image',
  image_storage_key: '',
  hover_image_storage_bucket: 'anhuy-image',
  hover_image_storage_key: '',
  sort_order: 0,
  is_active: true,
};

function slugCode(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildSectionForm(section) {
  return {
    ...emptySectionForm,
    id: section.id,
    code: section.code || '',
    title: section.title || '',
    description: section.description || '',
    sort_order: section.sort_order || 0,
    is_active: Boolean(section.is_active),
  };
}

function buildItemForm(item) {
  return {
    ...emptyItemForm,
    id: item.id,
    section_id: item.section_id || '',
    product_id: item.product_id || '',
    label: item.label || '',
    subtitle: item.subtitle || '',
    image_storage_key: item.image_storage_key || '',
    hover_image_storage_key: item.hover_image_storage_key || '',
    sort_order: item.sort_order || 0,
    is_active: Boolean(item.is_active),
  };
}

function FeaturedAdmin() {
  const [session, setSession] = featuredUseState(() => window.AuthService.getSession());
  const [activePanel, setActivePanel] = featuredUseState('sections');
  const [sections, setSections] = featuredUseState([]);
  const [items, setItems] = featuredUseState([]);
  const [products, setProducts] = featuredUseState([]);
  const [sectionForm, setSectionForm] = featuredUseState(emptySectionForm);
  const [itemForm, setItemForm] = featuredUseState(emptyItemForm);
  const [query, setQuery] = featuredUseState('');
  const [loading, setLoading] = featuredUseState(false);
  const [saving, setSaving] = featuredUseState(false);
  const [uploading, setUploading] = featuredUseState('');
  const [toast, setToast] = featuredUseState(null);

  function showToast(text, type = 'success') {
    setToast({ text, type });
  }

  async function loadData({ silent = false } = {}) {
    if (!window.AuthService.getSession()) return;
    setLoading(true);
    if (!silent) setToast(null);

    try {
      const [nextSections, nextItems, nextProducts] = await Promise.all([
        window.AdminFeaturedService.getSections(),
        window.AdminFeaturedService.getItems(),
        window.AdminFeaturedService.getProducts(),
      ]);
      setSections(nextSections || []);
      setItems(nextItems || []);
      setProducts(nextProducts || []);
    } catch (error) {
      showToast(error.message || 'Không tải được featured sections.', 'error');
    } finally {
      setLoading(false);
    }
  }

  featuredUseEffect(() => {
    if (session) loadData();
  }, [session]);

  featuredUseEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const sectionNameById = featuredUseMemo(() => {
    return sections.reduce((map, section) => ({ ...map, [section.id]: section.title }), {});
  }, [sections]);

  const productNameById = featuredUseMemo(() => {
    return products.reduce((map, product) => ({ ...map, [product.id]: product.name }), {});
  }, [products]);

  const filteredSections = featuredUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword || activePanel !== 'sections') return sections;
    return sections.filter((section) => (
      section.title?.toLowerCase().includes(keyword)
      || section.code?.toLowerCase().includes(keyword)
    ));
  }, [activePanel, query, sections]);

  const filteredItems = featuredUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword || activePanel !== 'items') return items;
    return items.filter((item) => (
      item.label?.toLowerCase().includes(keyword)
      || item.subtitle?.toLowerCase().includes(keyword)
      || sectionNameById[item.section_id]?.toLowerCase().includes(keyword)
      || productNameById[item.product_id]?.toLowerCase().includes(keyword)
    ));
  }, [activePanel, items, productNameById, query, sectionNameById]);

  function updateSectionField(name, value) {
    setSectionForm((current) => ({
      ...current,
      [name]: name === 'code' ? slugCode(value) : value,
    }));
  }

  function updateItemField(name, value) {
    setItemForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetSectionForm() {
    setSectionForm(emptySectionForm);
  }

  function resetItemForm() {
    setItemForm(emptyItemForm);
  }

  async function handleSectionSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminFeaturedService.saveSection(sectionForm);
      showToast(sectionForm.id ? 'Đã cập nhật section.' : 'Đã tạo section.');
      resetSectionForm();
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được section.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleItemSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminFeaturedService.saveItem(itemForm);
      showToast(itemForm.id ? 'Đã cập nhật item.' : 'Đã tạo item.');
      resetItemForm();
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được item.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSectionDelete(section) {
    const confirmed = window.confirm(`Xóa section "${section.title}"? Các item thuộc section này cũng sẽ bị xóa.`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminFeaturedService.deleteSection(section.id);
      if (sectionForm.id === section.id) resetSectionForm();
      if (itemForm.section_id === section.id) resetItemForm();
      showToast('Đã xóa section.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được section.', 'error');
    }
  }

  async function handleItemDelete(item) {
    const confirmed = window.confirm(`Xóa item "${item.label || productNameById[item.product_id] || item.id}"?`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminFeaturedService.deleteItem(item.id);
      if (itemForm.id === item.id) resetItemForm();
      showToast('Đã xóa item.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được item.', 'error');
    }
  }

  async function handleImageUpload(event, fieldName, bucketFieldName) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(fieldName);
    setToast(null);

    try {
      const section = sections.find((item) => item.id === itemForm.section_id);
      const folder = section?.code ? `featured/${section.code}` : 'featured';
      const result = await window.R2UploadService.uploadImage(file, folder);
      setItemForm((current) => ({
        ...current,
        [fieldName]: result.storage_key,
        [bucketFieldName]: result.bucket || current[bucketFieldName],
      }));
      showToast(result.optimized ? `Đã nén và upload ảnh (${result.size_label}).` : 'Đã upload ảnh.');
    } catch (error) {
      showToast(error.message || 'Không upload được ảnh.', 'error');
    } finally {
      setUploading('');
      event.target.value = '';
    }
  }

  function switchPanel(panel) {
    setActivePanel(panel);
    setQuery('');
  }

  function signOut() {
    window.AuthService.signOut();
    setSession(null);
    setSections([]);
    setItems([]);
    setProducts([]);
    resetSectionForm();
    resetItemForm();
  }

  if (!session) {
    return <window.AdminLogin onLogin={setSession} />;
  }

  const isSectionsPanel = activePanel === 'sections';

  return (
    <section className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <span>Featured CMS</span>
          <h1>{isSectionsPanel ? 'Quản lý sections' : 'Quản lý section items'}</h1>
        </div>
        <div className="admin-head-actions">
          <a href="#admin/products">Sản phẩm</a>
          <a href="#admin/categories">Danh mục</a>
          <a href="#admin/partners">Đối tác</a>
          <a href="#admin/navigation-groups">Nhóm menu</a>
          <button type="button" onClick={() => loadData()}>Tải lại</button>
          <button type="button" onClick={signOut}>Đăng xuất</button>
        </div>
      </div>

      <div className="admin-panel-tabs">
        <button className={isSectionsPanel ? 'active' : ''} type="button" onClick={() => switchPanel('sections')}>
          Sections
        </button>
        <button className={!isSectionsPanel ? 'active' : ''} type="button" onClick={() => switchPanel('items')}>
          Items
        </button>
      </div>

      {toast && (
        <div className={`admin-toast ${toast.type}`} role="status">
          <span>{toast.type === 'error' ? 'Lỗi' : 'Thành công'}</span>
          <p>{toast.text}</p>
          <button type="button" onClick={() => setToast(null)} aria-label="Đóng thông báo">×</button>
        </div>
      )}

      <div className="admin-products-layout admin-featured-layout">
        {isSectionsPanel ? (
          <form className="admin-product-form" onSubmit={handleSectionSubmit}>
            <div className="admin-form-title">
              <h2>{sectionForm.id ? 'Sửa section' : 'Thêm section'}</h2>
              {sectionForm.id && <button type="button" onClick={resetSectionForm}>Tạo mới</button>}
            </div>

            <label>
              Code
              <input value={sectionForm.code} onChange={(event) => updateSectionField('code', event.target.value)} required />
            </label>

            <label>
              Tiêu đề
              <input value={sectionForm.title} onChange={(event) => updateSectionField('title', event.target.value)} required />
            </label>

            <label>
              Mô tả
              <textarea value={sectionForm.description} onChange={(event) => updateSectionField('description', event.target.value)} rows="4" />
            </label>

            <div className="admin-form-grid">
              <label>
                Thứ tự
                <input type="number" value={sectionForm.sort_order} onChange={(event) => updateSectionField('sort_order', event.target.value)} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={sectionForm.is_active} onChange={(event) => updateSectionField('is_active', event.target.checked)} />
                Đang hiển thị
              </label>
            </div>

            <button className="admin-submit" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : sectionForm.id ? 'Cập nhật section' : 'Thêm section'}
            </button>
          </form>
        ) : (
          <form className="admin-product-form" onSubmit={handleItemSubmit}>
            <div className="admin-form-title">
              <h2>{itemForm.id ? 'Sửa item' : 'Thêm item'}</h2>
              {itemForm.id && <button type="button" onClick={resetItemForm}>Tạo mới</button>}
            </div>

            <label>
              Section
              <select value={itemForm.section_id} onChange={(event) => updateItemField('section_id', event.target.value)} required>
                <option value="">Chọn section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.title} ({section.code})</option>
                ))}
              </select>
            </label>

            <label>
              Product
              <select value={itemForm.product_id} onChange={(event) => updateItemField('product_id', event.target.value)}>
                <option value="">Không gắn product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} · {product.status}</option>
                ))}
              </select>
            </label>

            <label>
              Label override
              <input value={itemForm.label} onChange={(event) => updateItemField('label', event.target.value)} placeholder="Để trống sẽ lấy tên sản phẩm" />
            </label>

            <label>
              Subtitle
              <textarea value={itemForm.subtitle} onChange={(event) => updateItemField('subtitle', event.target.value)} rows="3" />
            </label>

            <label>
              Image storage key
              <input value={itemForm.image_storage_key} onChange={(event) => updateItemField('image_storage_key', event.target.value)} />
            </label>

            <label className="admin-upload-box">
              Upload ảnh item
              <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'image_storage_key', 'image_storage_bucket')} disabled={Boolean(uploading)} />
              <span>{uploading === 'image_storage_key' ? 'Đang upload...' : 'Chọn ảnh item'}</span>
            </label>

            <label>
              Hover image storage key
              <input value={itemForm.hover_image_storage_key} onChange={(event) => updateItemField('hover_image_storage_key', event.target.value)} />
            </label>

            <label className="admin-upload-box">
              Upload ảnh hover
              <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, 'hover_image_storage_key', 'hover_image_storage_bucket')} disabled={Boolean(uploading)} />
              <span>{uploading === 'hover_image_storage_key' ? 'Đang upload...' : 'Chọn ảnh hover'}</span>
            </label>

            <div className="admin-form-grid">
              <label>
                Thứ tự
                <input type="number" value={itemForm.sort_order} onChange={(event) => updateItemField('sort_order', event.target.value)} />
              </label>
              <label className="admin-checkbox">
                <input type="checkbox" checked={itemForm.is_active} onChange={(event) => updateItemField('is_active', event.target.checked)} />
                Đang hiển thị
              </label>
            </div>

            <button className="admin-submit" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : itemForm.id ? 'Cập nhật item' : 'Thêm item'}
            </button>
          </form>
        )}

        <div className="admin-products-list">
          <div className="admin-list-toolbar">
            <strong>{loading ? 'Đang tải...' : isSectionsPanel ? `${filteredSections.length} sections` : `${filteredItems.length} items`}</strong>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isSectionsPanel ? 'Tìm theo title, code' : 'Tìm theo label, product, section'}
            />
          </div>

          <div className="admin-product-table">
            {isSectionsPanel ? filteredSections.map((section) => (
              <article className="admin-product-row admin-category-row" key={section.id}>
                <div className="admin-nav-type"><span>SEC</span></div>
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.code}</p>
                  <small>{section.description || 'Không có mô tả'}</small>
                </div>
                <strong>{section.is_active ? 'active' : 'inactive'} · sort {section.sort_order || 0}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => setSectionForm(buildSectionForm(section))}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleSectionDelete(section)}>Xóa</button>
                </div>
              </article>
            )) : filteredItems.map((item) => (
              <article className="admin-product-row admin-category-row" key={item.id}>
                <div className={`admin-product-thumb ${item.image_url ? '' : 'empty'}`}>
                  {item.image_url ? <img src={item.image_url} alt={item.label || ''} loading="lazy" /> : <span>FS</span>}
                </div>
                <div>
                  <h3>{item.label || productNameById[item.product_id] || 'Item chưa đặt tên'}</h3>
                  <p>{sectionNameById[item.section_id] || 'Chưa gắn section'}</p>
                  <small>{productNameById[item.product_id] || item.subtitle || 'Không gắn product'}</small>
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

window.FeaturedAdmin = FeaturedAdmin;
})();
