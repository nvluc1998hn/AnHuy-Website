(function () {
const { useEffect: detailUseEffect, useMemo: detailUseMemo, useState: detailUseState } = React;
const DetailIcon = window.Icon;

const specIcons = ['diamond', 'right', 'brush', 'target'];

const emptyProduct = {
  name: 'Sản phẩm',
  slug: '',
  description: '',
  price: 0,
  categories: [],
  images: [],
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function getProductSlug(route) {
  return decodeURIComponent((route || '').replace('#product/', ''));
}

function ProductImage({ image, productName }) {
  if (!image?.src) {
    return <span className="product-detail-placeholder">ANHUY</span>;
  }

  return (
    <img
      src={image.src}
      alt={image.alt || productName}
      loading="lazy"
      decoding="async"
      onError={(event) => event.currentTarget.classList.add('image-fallback')}
    />
  );
}

function ProductDetail({ route }) {
  const [product, setProduct] = detailUseState(emptyProduct);
  const [loading, setLoading] = detailUseState(true);
  const [selectedImage, setSelectedImage] = detailUseState(null);
  const [quantity, setQuantity] = detailUseState(1);
  const [activeTab, setActiveTab] = detailUseState('description');
  const [added, setAdded] = detailUseState(false);
  const slug = getProductSlug(route);

  detailUseEffect(() => {
    let active = true;
    setLoading(true);
    window.ProductService.getProductDetail(slug)
      .then((data) => {
        if (!active || !data) return;
        setProduct(data);
        setSelectedImage(data.primaryImage || data.images[0] || null);
      })
      .catch((error) => console.warn(error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  detailUseEffect(() => {
    if (!added) return undefined;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const categoryNames = detailUseMemo(
    () => product.categories.map((category) => category.name).filter(Boolean),
    [product.categories],
  );
  const productType = categoryNames.find((name) => name.toLowerCase().includes('khay') && name !== 'Khay') || categoryNames[0] || 'An Huy';
  const gallery = product.images.length ? product.images : [selectedImage].filter(Boolean);
  const description = product.description || 'Thông tin sản phẩm đang được cập nhật.';

  if (!loading && !product.id) {
    return (
      <section className="product-detail-page">
        <nav className="product-detail-breadcrumb">
          <a href="#">Trang chủ</a>
          <span>›</span>
          <a href="#category/khay">Khay</a>
        </nav>
        <p className="product-detail-empty">Không tìm thấy sản phẩm.</p>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <nav className="product-detail-breadcrumb">
        <a href="#">Trang chủ</a>
        <span>›</span>
        <a href="#category/khay">Khay</a>
        <span>›</span>
        <strong>{product.name}</strong>
      </nav>

      <div className="product-detail-layout">
        <aside className="product-thumbs">
          {gallery.map((image, index) => (
            <button
              className={image?.id === selectedImage?.id || (!selectedImage?.id && index === 0) ? 'active' : ''}
              type="button"
              key={image?.id || index}
              onClick={() => setSelectedImage(image)}
              aria-label={`Ảnh sản phẩm ${index + 1}`}
            >
              <ProductImage image={image} productName={product.name} />
            </button>
          ))}
        </aside>

        <div className="product-main-image">
          <ProductImage image={selectedImage || product.primaryImage} productName={product.name} />
          <button type="button" aria-label="Xem ảnh lớn">
            <DetailIcon name="search" size={17} />
          </button>
        </div>

        <article className="product-detail-info">
          <span className="product-detail-type">{productType}</span>
          <h1>{product.name}</h1>
          <strong>{formatCurrency(product.price)}</strong>
          <p>{description}</p>

          <dl className="product-specs">
            <div>
              <span><DetailIcon name={specIcons[0]} size={15} /></span>
              <dt>Chất liệu</dt>
              <dd>{product.material || 'Đang cập nhật'}</dd>
            </div>
            <div>
              <span><DetailIcon name={specIcons[1]} size={15} /></span>
              <dt>Kích thước</dt>
              <dd>{product.size || 'Đang cập nhật'}</dd>
            </div>
            <div>
              <span><DetailIcon name={specIcons[2]} size={15} /></span>
              <dt>Bộ sưu tập</dt>
              <dd>{product.collection || 'Đang cập nhật'}</dd>
            </div>
            <div>
              <span><DetailIcon name={specIcons[3]} size={15} /></span>
              <dt>Danh mục</dt>
              <dd>{categoryNames.join(', ') || 'Đang cập nhật'}</dd>
            </div>
          </dl>

          <div className="product-cart-row">
            <span>Số lượng</span>
            <div className="quantity-stepper">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
              <output>{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => value + 1)}>+</button>
            </div>
          </div>

          <div className="product-actions">
            <button type="button" onClick={() => setAdded(true)}>
              {added ? 'Đã thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}
            </button>
            <button type="button" aria-label="Yêu thích">♡</button>
          </div>

          <ul className="product-benefits">
            <li>
              <DetailIcon name="truck" size={19} />
              <span>Miễn phí vận chuyển<br />đơn từ 2.000.000đ</span>
            </li>
            <li>
              <DetailIcon name="gift" size={19} />
              <span>Đóng gói quà<br />miễn phí</span>
            </li>
            <li>
              <DetailIcon name="shield" size={19} />
              <span>Đổi trả trong 7 ngày<br />nếu lỗi do nhà sản xuất</span>
            </li>
          </ul>
        </article>

        <aside className="product-story-card">
          <section>
            <h3>Câu chuyện sản phẩm</h3>
            <p>{description}</p>
          </section>
          <details>
            <summary>Hướng dẫn bảo quản</summary>
            <p>{product.material || description}</p>
          </details>
          <details>
            <summary>Chính sách đổi trả</summary>
            <p>{product.collection || description}</p>
          </details>
          <details>
            <summary>Giao hàng & thanh toán</summary>
            <p>{product.size || description}</p>
          </details>
        </aside>
      </div>

      <div className="product-detail-tabs">
        <div className="product-tabs-nav">
          <button className={activeTab === 'description' ? 'active' : ''} type="button" onClick={() => setActiveTab('description')}>Mô tả sản phẩm</button>
          <button className={activeTab === 'technical' ? 'active' : ''} type="button" onClick={() => setActiveTab('technical')}>Chi tiết kỹ thuật</button>
          <button className={activeTab === 'review' ? 'active' : ''} type="button" onClick={() => setActiveTab('review')}>Đánh giá</button>
        </div>

        <div className="product-tab-content">
          <div>
            {activeTab === 'description' && (
              <>
                <p>{description}</p>
                <p>Sản phẩm thích hợp để trưng bày, dùng trà, bàn khách hoặc làm quà tặng ý nghĩa.</p>
              </>
            )}
            {activeTab === 'technical' && (
              <dl>
                <div><dt>Chất liệu</dt><dd>{product.material || 'Đang cập nhật'}</dd></div>
                <div><dt>Kích thước</dt><dd>{product.size || 'Đang cập nhật'}</dd></div>
                <div><dt>Bộ sưu tập</dt><dd>{product.collection || 'Đang cập nhật'}</dd></div>
              </dl>
            )}
            {activeTab === 'review' && <p>Chưa có đánh giá nào cho sản phẩm này.</p>}
          </div>
          <div className="product-tab-image">
            <ProductImage image={selectedImage || product.primaryImage} productName={product.name} />
          </div>
          <ul className="product-trust-list">
            <li>{product.material || 'Chất liệu đang cập nhật'}</li>
            <li>{product.collection || 'Bộ sưu tập đang cập nhật'}</li>
            <li>{product.size || 'Kích thước đang cập nhật'}</li>
            <li>{categoryNames.join(', ') || 'Danh mục đang cập nhật'}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

window.ProductDetail = ProductDetail;
})();
