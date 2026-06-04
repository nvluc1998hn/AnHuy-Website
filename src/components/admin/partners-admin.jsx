(function () {
const { useEffect: partnerUseEffect, useMemo: partnerUseMemo, useState: partnerUseState } = React;

const emptyPartnerForm = {
  id: '',
  name: '',
  image_storage_bucket: 'anhuy-image',
  image_storage_key: '',
  original_image_storage_key: '',
  alt: '',
  sort_order: 0,
  is_active: true,
};

function buildForm(partner) {
  return {
    ...emptyPartnerForm,
    id: partner.id,
    name: partner.name || '',
    image_storage_bucket: partner.image_storage_bucket || emptyPartnerForm.image_storage_bucket,
    image_storage_key: partner.image_storage_key || '',
    original_image_storage_key: partner.image_storage_key || '',
    alt: partner.alt || '',
    sort_order: partner.sort_order || 0,
    is_active: Boolean(partner.is_active),
  };
}

function buildLogoUrl(storageKey) {
  if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
  const baseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '') || window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
  return baseUrl && storageKey ? `${baseUrl}/${storageKey.replace(/^\//, '')}` : '';
}

function PartnersAdmin() {
  const [session, setSession] = partnerUseState(() => window.AuthService.getSession());
  const [partners, setPartners] = partnerUseState([]);
  const [form, setForm] = partnerUseState(emptyPartnerForm);
  const [query, setQuery] = partnerUseState('');
  const [loading, setLoading] = partnerUseState(false);
  const [saving, setSaving] = partnerUseState(false);
  const [uploading, setUploading] = partnerUseState(false);
  const [toast, setToast] = partnerUseState(null);

  const previewUrl = buildLogoUrl(form.image_storage_key);

  function showToast(text, type = 'success') {
    setToast({ text, type });
  }

  async function loadPartners({ silent = false } = {}) {
    if (!window.AuthService.getSession()) return;
    setLoading(true);
    if (!silent) setToast(null);

    try {
      setPartners(await window.AdminPartnerService.getPartners());
    } catch (error) {
      showToast(error.message || 'Không tải được danh sách đối tác.', 'error');
    } finally {
      setLoading(false);
    }
  }

  partnerUseEffect(() => {
    if (session) loadPartners();
  }, [session]);

  partnerUseEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredPartners = partnerUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return partners;

    return partners.filter((partner) => (
      partner.name?.toLowerCase().includes(keyword)
      || partner.alt?.toLowerCase().includes(keyword)
      || partner.image_storage_key?.toLowerCase().includes(keyword)
    ));
  }, [partners, query]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      alt: name === 'name' && !current.alt ? value : current.alt,
    }));
  }

  function resetForm() {
    setForm(emptyPartnerForm);
  }

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setToast(null);

    try {
      const result = await window.R2UploadService.uploadImage(file, 'partners');
      setForm((current) => ({
        ...current,
        image_storage_bucket: result.bucket || current.image_storage_bucket,
        image_storage_key: result.storage_key,
      }));
      showToast(result.optimized ? `Đã nén và upload logo (${result.size_label}).` : 'Đã upload logo.');
    } catch (error) {
      showToast(error.message || 'Không upload được logo.', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminPartnerService.savePartner(form);
      let cleanupWarning = false;

      if (form.id && form.original_image_storage_key && form.original_image_storage_key !== form.image_storage_key) {
        try {
          await window.AdminPartnerService.deleteLogo(form.original_image_storage_key);
        } catch (error) {
          cleanupWarning = true;
          console.warn('Could not delete old partner logo from R2:', error);
        }
      }

      showToast(cleanupWarning
        ? 'Đã cập nhật đối tác, nhưng chưa xóa được logo cũ trên Cloudflare.'
        : form.id ? 'Đã cập nhật đối tác.' : 'Đã tạo đối tác.');
      resetForm();
      await loadPartners({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được đối tác.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(partner) {
    const confirmed = window.confirm(`Xóa đối tác "${partner.name}"? Logo trên Cloudflare cũng sẽ được xóa nếu có.`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminPartnerService.deletePartner(partner);
      if (form.id === partner.id) resetForm();
      showToast('Đã xóa đối tác.');
      await loadPartners({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được đối tác.', 'error');
    }
  }

  function signOut() {
    window.AuthService.signOut();
    setSession(null);
    setPartners([]);
    resetForm();
  }

  if (!session) {
    return <window.AdminLogin onLogin={setSession} />;
  }

  return (
    <section className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <span>Partner CMS</span>
          <h1>Quản lý đối tác</h1>
        </div>
        <div className="admin-head-actions">
          <a href="#admin/products">Sản phẩm</a>
          <a href="#admin/featured">Featured</a>
          <a href="#admin/categories">Danh mục</a>
          <a href="#admin/navigation-groups">Nhóm menu</a>
          <button type="button" onClick={() => loadPartners()}>Tải lại</button>
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

      <div className="admin-products-layout admin-partners-layout">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-title">
            <h2>{form.id ? 'Sửa đối tác' : 'Thêm đối tác'}</h2>
            {form.id && <button type="button" onClick={resetForm}>Tạo mới</button>}
          </div>

          <div className={`admin-partner-preview ${previewUrl ? '' : 'empty'}`}>
            {previewUrl ? <img src={previewUrl} alt={form.alt || form.name || 'Logo đối tác'} /> : <span>LOGO</span>}
          </div>

          <label>
            Tên đối tác
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>

          <label>
            Alt text
            <input value={form.alt} onChange={(event) => updateField('alt', event.target.value)} placeholder="Mô tả logo cho SEO/accessibility" />
          </label>

          <label>
            Logo storage key
            <input value={form.image_storage_key} onChange={(event) => updateField('image_storage_key', event.target.value)} required />
          </label>

          <label className="admin-upload-box">
            Upload logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
            <span>{uploading ? 'Đang upload...' : 'Chọn logo'}</span>
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

          <button className="admin-submit" type="submit" disabled={saving || uploading}>
            {saving ? 'Đang lưu...' : form.id ? 'Cập nhật đối tác' : 'Thêm đối tác'}
          </button>
        </form>

        <div className="admin-products-list">
          <div className="admin-list-toolbar">
            <strong>{loading ? 'Đang tải...' : `${filteredPartners.length} đối tác`}</strong>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, alt, storage key" />
          </div>

          <div className="admin-product-table">
            {filteredPartners.map((partner) => (
              <article className="admin-product-row admin-partner-row" key={partner.id}>
                <div className={`admin-partner-thumb ${partner.image_url ? '' : 'empty'}`}>
                  {partner.image_url ? <img src={partner.image_url} alt={partner.alt || partner.name} loading="lazy" /> : <span>LOGO</span>}
                </div>
                <div>
                  <h3>{partner.name}</h3>
                  <p>{partner.alt || 'Chưa có alt text'}</p>
                  <small>{partner.image_storage_key}</small>
                </div>
                <strong>{partner.is_active ? 'active' : 'inactive'} · sort {partner.sort_order || 0}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => setForm(buildForm(partner))}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleDelete(partner)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.PartnersAdmin = PartnersAdmin;
})();
