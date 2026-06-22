(function () {
const {
  memo: categoryMemo,
  useEffect: categoryUseEffect,
  useMemo: categoryUseMemo,
  useRef: categoryUseRef,
  useState: categoryUseState,
} = React;
const { cdn } = window.SiteData;
const CategoryIcon = window.Icon;

const PAGE_SIZE = 8;

const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
];

const emptyListing = {
  rootCategory: { name: 'Danh mục', slug: '' },
  filters: [],
  counts: {},
  products: [],
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function sortProducts(products, sortMode) {
  return [...products].sort((first, second) => {
    if (sortMode === 'price-asc') return Number(first.price || 0) - Number(second.price || 0);
    if (sortMode === 'price-desc') return Number(second.price || 0) - Number(first.price || 0);
    return new Date(second.created_at || 0) - new Date(first.created_at || 0);
  });
}

const ProductCard = categoryMemo(function ProductCard({ product }) {
  return (
    <article className="category-product">
      <a className={`category-product-image ${product.image ? '' : 'empty'}`} href={`#product/${product.slug}`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.alt || product.name}
            loading="lazy"
            decoding="async"
            onError={(event) => event.currentTarget.classList.add('image-fallback')}
          />
        ) : (
          <span>ANHUY</span>
        )}
      </a>
      <div className="category-product-meta">
        <a href={`#product/${product.slug}`}>{product.name}</a>
        <button aria-label="Yêu thích">♡</button>
      </div>
      <p>{formatCurrency(product.price)}</p>
    </article>
  );
});

function CategoryListing({ route = '#category/khay' }) {
  const routeSlug = decodeURIComponent(route.replace('#category/', '') || 'khay');
  const [listing, setListing] = categoryUseState(emptyListing);
  const [loading, setLoading] = categoryUseState(true);
  const [activeSlug, setActiveSlug] = categoryUseState(routeSlug);
  const [sortMode, setSortMode] = categoryUseState('newest');
  const [sortOpen, setSortOpen] = categoryUseState(false);
  const [visibleCount, setVisibleCount] = categoryUseState(PAGE_SIZE);
  const loadMoreRef = categoryUseRef(null);
  const visibleCountCacheRef = categoryUseRef(new Map());

  categoryUseEffect(() => {
    let active = true;
    setLoading(true);
    setListing(emptyListing);
    setActiveSlug(routeSlug);
    setSortMode('newest');
    setSortOpen(false);
    visibleCountCacheRef.current.clear();

    window.CategoryService.getCategoryListing(routeSlug)
      .then((data) => {
        if (active && data) setListing(data);
      })
      .catch((error) => console.warn(error))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [routeSlug]);

  categoryUseEffect(() => {
    const name = listing.rootCategory?.name;
    if (name && name !== 'Danh mục') document.title = `${name} | An Huy`;
  }, [listing.rootCategory?.name]);

  const filters = listing.filters.length ? listing.filters : [listing.rootCategory];
  const activeFilter = filters.find((filter) => filter.slug === activeSlug) || listing.rootCategory;
  const activeFilterId = activeFilter.id || activeFilter.slug;
  const activeCategoryIds = activeFilter.category_ids || [activeFilterId];
  const displayCounts = {
    ...listing.counts,
    [listing.rootCategory.id || listing.rootCategory.slug]: listing.counts[listing.rootCategory.id] || listing.products.length,
  };
  const filteredProducts = categoryUseMemo(
    () => (
      activeSlug === listing.rootCategory.slug
        ? listing.products
        : listing.products.filter((product) => product.category_ids?.some((id) => activeCategoryIds.includes(id)))
    ),
    [activeCategoryIds, activeSlug, listing.products, listing.rootCategory.slug],
  );
  const sortedProducts = categoryUseMemo(
    () => sortProducts(filteredProducts, sortMode),
    [filteredProducts, sortMode],
  );
  const activeTotal = filteredProducts.length;
  const cacheKey = `${activeSlug}:${sortMode}`;
  const visibleProducts = categoryUseMemo(
    () => sortedProducts.slice(0, visibleCount),
    [sortedProducts, visibleCount],
  );
  const canLoadMore = visibleCount < sortedProducts.length;
  const currentSortLabel = sortOptions.find((option) => option.value === sortMode)?.label || 'Mới nhất';

  categoryUseEffect(() => {
    const cachedCount = visibleCountCacheRef.current.get(cacheKey);
    setVisibleCount(Math.min(cachedCount || PAGE_SIZE, Math.max(activeTotal, PAGE_SIZE)));
  }, [cacheKey, activeTotal]);

  categoryUseEffect(() => {
    visibleCountCacheRef.current.set(cacheKey, visibleCount);
  }, [cacheKey, visibleCount]);

  categoryUseEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !canLoadMore) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setVisibleCount((current) => Math.min(current + PAGE_SIZE, sortedProducts.length));
    }, { rootMargin: '420px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, sortedProducts.length, cacheKey]);

  categoryUseEffect(() => {
    if (!sortOpen) return undefined;

    const closeSort = () => setSortOpen(false);
    window.addEventListener('click', closeSort);
    return () => window.removeEventListener('click', closeSort);
  }, [sortOpen]);

  return (
    <section className="category-page">
      <aside className="category-sidebar">
        <nav className="category-breadcrumb">
          <a href="#">Trang chủ</a>
          <span>›</span>
          <a href="#">Trang trí nhà</a>
          <span>›</span>
          <strong>{listing.rootCategory.name}</strong>
        </nav>

        <h1>{listing.rootCategory.name}</h1>
        <p>Tinh tế trong từng chi tiết, sản phẩm An Huy là sự kết hợp giữa công năng và nghệ thuật.</p>

        <ul className="category-filter">
          {filters.map((filter) => {
            const id = filter.id || filter.slug;
            const label = filter.slug === listing.rootCategory.slug ? `Tất cả ${listing.rootCategory.name}` : filter.name;
            return (
              <li key={id} className={filter.slug === activeSlug ? 'active' : ''}>
                <button onClick={() => setActiveSlug(filter.slug)}>
                  <span>{label}</span>
                  <small>{displayCounts[id] || 0}</small>
                </button>
              </li>
            );
          })}
        </ul>

        <img className="category-sidebar-art" src={`${cdn}Homepage_2_Copy_.webp`} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
      </aside>

      <div className="category-main">
        <div className="category-toolbar">
          <div className="category-view">
            <button aria-label="Grid view">
              <span />
              <span />
              <span />
              <span />
            </button>
            <button aria-label="List view">
              <i />
              <i />
              <i />
            </button>
          </div>

          <p>Hiển thị {visibleProducts.length ? 1 : 0}-{visibleProducts.length} trong {activeTotal} sản phẩm</p>

          <div className={`category-sort ${sortOpen ? 'open' : ''}`} onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSortOpen((open) => !open)} aria-expanded={sortOpen} aria-haspopup="listbox">
              <span>Sắp xếp: {currentSortLabel}</span>
              <CategoryIcon name="right" size={14} />
            </button>
            {sortOpen && (
              <div className="category-sort-menu" role="listbox">
                {sortOptions.map((option) => (
                  <button
                    type="button"
                    className={option.value === sortMode ? 'active' : ''}
                    key={option.value}
                    role="option"
                    aria-selected={option.value === sortMode}
                    onClick={() => {
                      setSortMode(option.value);
                      setSortOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="category-grid">
          {visibleProducts.map((product) => (
            <ProductCard product={product} key={product.id || product.name} />
          ))}
        </div>

        {!loading && !visibleProducts.length && (
          <p className="category-empty">Chưa có sản phẩm được xuất bản trong danh mục này.</p>
        )}

        <div className="category-load-more" ref={loadMoreRef}>
          {canLoadMore ? (
            <button onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, sortedProducts.length))}>
              Xem thêm sản phẩm
            </button>
          ) : (
            Boolean(sortedProducts.length) && <span>Đã hiển thị toàn bộ sản phẩm</span>
          )}
        </div>
      </div>
    </section>
  );
}

window.CategoryListing = CategoryListing;
})();
