(function () {
const { useEffect: bestUseEffect, useState: bestUseState } = React;
const fallbackProducts = Array.isArray(window.SiteData?.products) ? window.SiteData.products : [];

function ProductTile({ product, featured = false, onSelect }) {
  const image = product.image_url || product.public_url || product.image;
  const hoverImage = product.hover_image_url || product.hover_image;

  return (
    <button className={`product-tile reveal is-visible ${featured ? 'featured' : ''}`} onClick={() => onSelect(product)}>
      <span className={`product-image ${hoverImage ? 'has-hover-image' : ''}`}>
        {image ? (
          <img className="product-image-main" src={image} alt={product.name} onError={(event) => event.currentTarget.classList.add('image-fallback')} />
        ) : (
          <span className="product-placeholder">ANHUY</span>
        )}
        {hoverImage && (
          <img className="product-image-hover" src={hoverImage} alt="" aria-hidden="true" onError={(event) => event.currentTarget.remove()} />
        )}
        <span className="product-hover">Chi tiết</span>
      </span>
    </button>
  );
}

function ProductDetail({ product, onClose }) {
  if (!product) return null;
  const image = product.image_url || product.public_url || product.image;

  return (
    <div className="detail-layer" role="dialog" aria-modal="true" aria-label={`Chi tiết ${product.name}`}>
      <button className="detail-backdrop" onClick={onClose} aria-label="Đóng chi tiết sản phẩm" />
      <article className="detail-panel">
        <button className="detail-close" onClick={onClose} aria-label="Đóng">
          <window.Icon name="x" size={19} />
        </button>
        <div className="detail-media">
          {image ? <img src={image} alt={product.name} onError={(event) => event.currentTarget.classList.add('image-fallback')} /> : <span>ANHUY</span>}
        </div>
        <div className="detail-copy">
          <span>{product.collection}</span>
          <h3>{product.name}</h3>
          <strong>{product.price}</strong>
          <p>{product.description}</p>
          <dl>
            <div>
              <dt>Chất liệu</dt>
              <dd>{product.material || 'Đang cập nhật'}</dd>
            </div>
            <div>
              <dt>Kích thước</dt>
              <dd>{product.size || 'Đang cập nhật'}</dd>
            </div>
          </dl>
          <div className="detail-actions">
            <a href={product.slug ? `#product/${product.slug}` : '#'}>Xem sản phẩm</a>
            <button onClick={onClose}>Tiếp tục xem</button>
          </div>
        </div>
      </article>
    </div>
  );
}

function BestSeller() {
  const [selectedProduct, setSelectedProduct] = bestUseState(null);
  const [section, setSection] = bestUseState({
    title: 'BEST SELLER',
    description: 'Khám phá những sản phẩm được yêu thích nhất',
    items: fallbackProducts,
  });

  bestUseEffect(() => {
    let active = true;
    if (!window.FeaturedService?.getFeaturedSection) return () => {};

    window.FeaturedService.getFeaturedSection('best-seller')
      .then((data) => {
        if (active && Array.isArray(data?.items) && data.items.length) {
          setSection({
            title: data.title || 'BEST SELLER',
            description: data.description || '',
            items: data.items,
          });
        }
      })
      .catch((error) => console.warn(error));
    return () => {
      active = false;
    };
  }, []);

  bestUseEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : '';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedProduct]);

  return (
    <section id="best-seller" className="section best-seller">
      <window.SectionTitle title={section.title || 'BEST SELLER'} copy={section.description || 'Khám phá những sản phẩm được yêu thích nhất'} />
      <div className="product-grid">
        {(Array.isArray(section.items) ? section.items : []).map((product, index) => (
          <ProductTile key={product.id || product.name} product={product} featured={index === 0} onSelect={setSelectedProduct} />
        ))}
      </div>
      <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}

window.BestSeller = BestSeller;
})();
