(function () {
const { useEffect: adminUseEffect, useMemo: adminUseMemo, useState: adminUseState } = React;

const emptyForm = {
  id: '',
  category_id: '',
  category_ids: [],
  name: '',
  slug: '',
  description: '',
  price: '',
  collection: '',
  material: '',
  size: '',
  status: 'draft',
  is_featured: false,
  sort_order: 0,
  image_storage_key: '',
  image_public_url: '',
  image_alt: '',
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

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function buildForm(product) {
  return {
    ...emptyForm,
    id: product.id,
    category_id: product.category_id || '',
    category_ids: product.category_ids || [],
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    price: product.price || '',
    collection: product.collection || '',
    material: product.material || '',
    size: product.size || '',
    status: product.status || 'draft',
    is_featured: Boolean(product.is_featured),
    sort_order: product.sort_order || 0,
    image_storage_key: product.primary_image?.storage_key || '',
    image_public_url: product.primary_image?.public_url || '',
    image_alt: product.primary_image?.alt || product.name || '',
  };
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = adminUseState('');
  const [password, setPassword] = adminUseState('');
  const [showPassword, setShowPassword] = adminUseState(false);
  const [error, setError] = adminUseState('');
  const [submitting, setSubmitting] = adminUseState(false);
  const loginImage = '/src/assets/anhuy-logo.png';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const session = await window.AuthService.signIn(email, password);
      onLogin(session);
    } catch (loginError) {
      setError(loginError.message || 'Không đăng nhập được.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-login-page">
      <div className="admin-login-shell">
        <aside className="admin-login-visual" style={{ backgroundImage: `url(${loginImage})` }} aria-label="An Huy" />

        <form className="admin-login-panel" onSubmit={handleSubmit}>
          <a className="admin-login-close" href="#" aria-label="Đóng đăng nhập">×</a>
          <div className="admin-login-title">
            <h1>Đăng nhập</h1>
            <p>Chào mừng bạn quay trở lại An Huy</p>
          </div>

          <label>
            Email
            <span className="admin-input-wrap">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
              <i aria-hidden="true">✉</i>
            </span>
          </label>

          <label>
            Mật khẩu
            <span className="admin-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Ẩn hiện mật khẩu">
                {showPassword ? '○' : '◉'}
              </button>
            </span>
          </label>

          <a className="admin-forgot-link" href="#">Quên mật khẩu?</a>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="admin-login-divider"><span>Hoặc</span></div>
          <div className="admin-social-row">
            <button type="button"><strong>G</strong> Đăng nhập với Google</button>
            <button type="button"><strong>f</strong> Đăng nhập với Facebook</button>
          </div>
          <p className="admin-signup-text">Chưa có tài khoản? <a href="#">Tạo tài khoản</a></p>
        </form>
      </div>
    </section>
  );
}

function ProductAdmin() {
  const [session, setSession] = adminUseState(() => window.AuthService.getSession());
  const [products, setProducts] = adminUseState([]);
  const [categories, setCategories] = adminUseState([]);
  const [form, setForm] = adminUseState(emptyForm);
  const [productImages, setProductImages] = adminUseState([]);
  const [loading, setLoading] = adminUseState(false);
  const [saving, setSaving] = adminUseState(false);
  const [uploadingImage, setUploadingImage] = adminUseState(false);
  const [toast, setToast] = adminUseState(null);
  const [query, setQuery] = adminUseState('');

  function showToast(text, type = 'success') {
    setToast({ text, type });
  }

  async function loadData({ silent = false } = {}) {
    if (!window.AuthService.getSession()) return;
    setLoading(true);
    if (!silent) setToast(null);

    try {
      const [categoryRows, productRows] = await Promise.all([
        window.AdminProductService.getCategories(),
        window.AdminProductService.getProducts(),
      ]);
      setCategories(categoryRows);
      setProducts(productRows);
    } catch (error) {
      showToast(error.message || 'Không tải được dữ liệu.', 'error');
    } finally {
      setLoading(false);
    }
  }

  adminUseEffect(() => {
    if (session) loadData();
  }, [session]);

  adminUseEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredProducts = adminUseMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => (
      product.name?.toLowerCase().includes(keyword)
      || product.slug?.toLowerCase().includes(keyword)
      || product.status?.toLowerCase().includes(keyword)
    ));
  }, [products, query]);

  const categoryById = adminUseMemo(() => {
    return categories.reduce((result, category) => {
      result[category.id] = category;
      return result;
    }, {});
  }, [categories]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      slug: name === 'name' && !current.id ? slugify(value) : current.slug,
    }));
  }

  function toggleCategory(categoryId) {
    setForm((current) => {
      const exists = current.category_ids.includes(categoryId);
      return {
        ...current,
        category_ids: exists
          ? current.category_ids.filter((id) => id !== categoryId)
          : [...current.category_ids, categoryId],
      };
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setProductImages([]);
  }

  function editProduct(product) {
    setForm(buildForm(product));
    setProductImages(product.images || []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      await window.AdminProductService.saveProduct({
        ...form,
        images: productImages,
      });
      showToast(form.id ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm mới.');
      resetForm();
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không lưu được sản phẩm.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.name}"?`);
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminProductService.deleteProduct(product.id);
      if (form.id === product.id) resetForm();
      showToast('Đã xóa sản phẩm.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được sản phẩm.', 'error');
    }
  }

  async function handleImageUpload(event) {
    const files = [...(event.target.files || [])];
    if (!files.length) return;

    setUploadingImage(true);
    setToast(null);

    try {
      const folder = form.slug ? `products/${form.slug}` : 'products';
      const results = await Promise.all(files.map((file) => window.R2UploadService.uploadImage(file, folder)));
      setProductImages((current) => {
        const hasPrimary = current.some((image) => image.is_primary);
        return [
          ...current,
          ...results.map((result, index) => ({
            id: '',
            storage_key: result.storage_key || '',
            public_url: result.public_url || '',
            alt: form.name || files[index]?.name || '',
            is_primary: !hasPrimary && index === 0,
            sort_order: (current.length + index + 1) * 10,
            image_url: result.public_url || '',
          })),
        ];
      });
      const firstResult = results[0];
      setForm((current) => ({
        ...current,
        image_storage_key: current.image_storage_key || firstResult.storage_key || '',
        image_public_url: current.image_public_url || firstResult.public_url || '',
        image_alt: current.image_alt || current.name || files[0]?.name || '',
      }));
      showToast(results.length > 1 ? `Đã upload ${results.length} ảnh lên Cloudflare R2.` : (firstResult.optimized ? `Đã nén và upload ảnh (${firstResult.size_label}).` : 'Đã upload ảnh lên Cloudflare R2.'));
    } catch (error) {
      showToast(error.message || 'Không upload được ảnh.', 'error');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  async function handleDeleteImage(image) {
    const confirmed = window.confirm('Xóa ảnh này khỏi sản phẩm và Cloudflare R2?');
    if (!confirmed) return;

    setToast(null);
    try {
      await window.AdminProductService.deleteProductImage(image);
      setProductImages((current) => current.filter((item) => item !== image && item.id !== image.id));
      showToast('Đã xóa ảnh sản phẩm.');
      if (form.id) await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không xóa được ảnh.', 'error');
    }
  }

  async function handlePrimaryImage(image) {
    setProductImages((current) => current.map((item) => ({
      ...item,
      is_primary: item === image || (image.id && item.id === image.id),
    })));

    if (!form.id || !image.id) return;

    try {
      await window.AdminProductService.setPrimaryImage(form.id, image.id);
      showToast('Đã đặt ảnh chính.');
      await loadData({ silent: true });
    } catch (error) {
      showToast(error.message || 'Không đặt được ảnh chính.', 'error');
    }
  }

  function signOut() {
    window.AuthService.signOut();
    setSession(null);
    setProducts([]);
    setCategories([]);
    setForm(emptyForm);
  }

  if (!session) {
    return <AdminLogin onLogin={setSession} />;
  }

  return (
    <section className="admin-products-page">
      <div className="admin-products-head">
        <div>
          <span>Product CMS</span>
          <h1>Quản lý sản phẩm</h1>
        </div>
        <div className="admin-head-actions">
          <a href="#admin/featured">Featured</a>
          <a href="#admin/partners">Đối tác</a>
          <a href="#admin/categories">Danh mục</a>
          <a href="#admin/navigation-groups">Nhóm menu</a>
          <button type="button" onClick={loadData}>Tải lại</button>
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

      <div className="admin-products-layout">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-title">
            <h2>{form.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
            {form.id && <button type="button" onClick={resetForm}>Tạo mới</button>}
          </div>

          <label>
            Tên sản phẩm
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </label>

          <label>
            Slug
            <input value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} required />
          </label>

          <div className="admin-form-grid">
            <label>
              Giá
              <input type="number" min="0" value={form.price} onChange={(event) => updateField('price', event.target.value)} />
            </label>
            <label>
              Trạng thái
              <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label>
            Mô tả
            <textarea rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} />
          </label>

          <div className="admin-form-grid">
            <label>
              Collection
              <input value={form.collection} onChange={(event) => updateField('collection', event.target.value)} />
            </label>
            <label>
              Chất liệu
              <input value={form.material} onChange={(event) => updateField('material', event.target.value)} />
            </label>
            <label>
              Kích thước
              <input value={form.size} onChange={(event) => updateField('size', event.target.value)} />
            </label>
            <label>
              Thứ tự
              <input type="number" value={form.sort_order} onChange={(event) => updateField('sort_order', event.target.value)} />
            </label>
          </div>

          <label>
            Danh mục chính
            <select value={form.category_id} onChange={(event) => updateField('category_id', event.target.value)}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

          <fieldset className="admin-category-checks">
            <legend>Danh mục hiển thị/filter</legend>
            {categories.map((category) => (
              <label key={category.id}>
                <input
                  type="checkbox"
                  checked={form.category_ids.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            ))}
          </fieldset>

          <div className="admin-form-grid">
            <label>
              R2 storage key
              <input value={form.image_storage_key} onChange={(event) => updateField('image_storage_key', event.target.value)} placeholder="products/name/main.webp" />
            </label>
            <label>
              Public image URL
              <input value={form.image_public_url} onChange={(event) => updateField('image_public_url', event.target.value)} placeholder="https://cdn..." />
            </label>
          </div>

          <label className="admin-upload-box">
            Upload ảnh lên Cloudflare R2
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
            <span>{uploadingImage ? 'Đang upload...' : 'Chọn một hoặc nhiều ảnh từ máy của bạn'}</span>
          </label>

          <div className="admin-image-manager">
            <div className="admin-image-manager-head">
              <strong>Ảnh sản phẩm</strong>
              <small>{productImages.length} ảnh</small>
            </div>
            {productImages.length ? (
              <div className="admin-image-grid">
                {productImages.map((image, index) => (
                  <article className="admin-image-item" key={image.id || image.storage_key || index}>
                    <div className={`admin-image-preview ${image.image_url || image.public_url ? '' : 'empty'}`}>
                      {image.image_url || image.public_url ? (
                        <img src={image.image_url || image.public_url} alt={image.alt || form.name} loading="lazy" />
                      ) : (
                        <span>AN</span>
                      )}
                    </div>
                    <div>
                      <p>{image.alt || form.name || `Ảnh ${index + 1}`}</p>
                      <small>{image.storage_key || 'external image'}</small>
                    </div>
                    <div className="admin-image-actions">
                      <button type="button" className={image.is_primary ? 'primary active' : 'primary'} onClick={() => handlePrimaryImage(image)}>
                        {image.is_primary ? 'Ảnh chính' : 'Đặt chính'}
                      </button>
                      <button type="button" className="delete" onClick={() => handleDeleteImage(image)}>Xóa ảnh</button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-image-empty">Chưa có ảnh nào cho sản phẩm này.</p>
            )}
          </div>

          <label>
            Alt ảnh
            <input value={form.image_alt} onChange={(event) => updateField('image_alt', event.target.value)} />
          </label>

          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_featured} onChange={(event) => updateField('is_featured', event.target.checked)} />
            Sản phẩm nổi bật
          </label>

          <button className="admin-submit" type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : form.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
          </button>
        </form>

        <div className="admin-products-list">
          <div className="admin-list-toolbar">
            <strong>{loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm`}</strong>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, slug, status" />
          </div>

          <div className="admin-product-table">
            {filteredProducts.map((product) => (
              <article className="admin-product-row" key={product.id}>
                <div className={`admin-product-thumb ${product.image_url ? '' : 'empty'}`}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" /> : <span>AN</span>}
                </div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.slug}</p>
                  <small>{categoryById[product.category_id]?.name || 'Chưa gán danh mục'} · {product.status}</small>
                </div>
                <strong>{formatCurrency(product.price)}</strong>
                <div className="admin-row-actions">
                  <button className="edit" type="button" onClick={() => editProduct(product)}>Sửa</button>
                  <button className="delete" type="button" onClick={() => handleDelete(product)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.AdminLogin = AdminLogin;
window.ProductAdmin = ProductAdmin;
})();
