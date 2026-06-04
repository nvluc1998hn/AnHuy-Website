(function () {
  function hasSupabaseConfig() {
    return Boolean(window.AppConfig?.supabaseUrl && window.AppConfig?.supabasePublishableKey);
  }

  function getSupabaseHeaders() {
    const publishableKey = window.AppConfig.supabasePublishableKey;
    const headers = {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    };

    if (publishableKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${publishableKey}`;
    }

    return headers;
  }

  async function fetchJson(path) {
    const baseUrl = window.AppConfig.supabaseUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
      headers: getSupabaseHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`);
    }

    return response.json();
  }

  function buildAssetUrl(image) {
    if (image?.public_url) return image.public_url;

    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !image?.storage_key) return '';
    return `${baseUrl}/${image.storage_key.replace(/^\//, '')}`;
  }

  function getDescendantIds(categoryId, childrenByParentId) {
    const children = childrenByParentId[categoryId] || [];
    return children.reduce((result, child) => {
      return [...result, child.id, ...getDescendantIds(child.id, childrenByParentId)];
    }, []);
  }

  async function getCategoryListing(categorySlug = 'khay') {
    if (!hasSupabaseConfig()) return null;

    const allCategories = await fetchJson(
      'categories?select=id,name,slug,parent_id,sort_order,is_active&is_active=eq.true&order=sort_order.asc',
    );

    const rootCategory = allCategories.find((category) => category.slug === categorySlug);
    if (!rootCategory) return null;

    const childrenByParentId = allCategories.reduce((result, category) => {
      if (!result[category.parent_id]) result[category.parent_id] = [];
      result[category.parent_id].push(category);
      return result;
    }, {});
    const childCategories = childrenByParentId[rootCategory.id] || [];
    const categoryIds = [rootCategory.id, ...getDescendantIds(rootCategory.id, childrenByParentId)];
    const filters = [rootCategory, ...childCategories].map((category) => ({
      ...category,
      category_ids: [category.id, ...getDescendantIds(category.id, childrenByParentId)],
    }));

    const relations = await fetchJson(`product_categories?select=product_id,category_id&category_id=in.(${categoryIds.join(',')})`);
    const directProducts = await fetchJson(
      `products?select=id,name,slug,description,price,status,sort_order,created_at,category_id&status=eq.published&category_id=in.(${categoryIds.join(',')})&order=created_at.desc`,
    );
    const productIds = [...new Set([
      ...relations.map((relation) => relation.product_id),
      ...directProducts.map((product) => product.id),
    ])];

    if (!productIds.length) {
      return { rootCategory, filters, counts: {}, products: [] };
    }

    const idList = productIds.join(',');
    const [products, images] = await Promise.all([
      fetchJson(`products?select=id,name,slug,description,price,status,sort_order,created_at,category_id&status=eq.published&id=in.(${idList})&order=created_at.desc`),
      fetchJson(`product_images?select=product_id,storage_key,public_url,alt,is_primary,sort_order&product_id=in.(${idList})&order=sort_order.asc`),
    ]);

    const publishedIds = new Set(products.map((product) => product.id));
    const categoryIdsByProductId = relations.reduce((result, relation) => {
      if (!result[relation.product_id]) result[relation.product_id] = [];
      result[relation.product_id].push(relation.category_id);
      return result;
    }, {});

    products.forEach((product) => {
      if (!product.category_id) return;
      if (!categoryIdsByProductId[product.id]) categoryIdsByProductId[product.id] = [];
      if (!categoryIdsByProductId[product.id].includes(product.category_id)) {
        categoryIdsByProductId[product.id].push(product.category_id);
      }
    });

    const counts = filters.reduce((result, filter) => {
      const filterCategoryIds = new Set(filter.category_ids || [filter.id]);
      result[filter.id] = products.reduce((total, product) => {
        if (!publishedIds.has(product.id)) return total;
        const productCategoryIds = categoryIdsByProductId[product.id] || [];
        return productCategoryIds.some((id) => filterCategoryIds.has(id)) ? total + 1 : total;
      }, 0);
      return result;
    }, {});

    const primaryImages = images.reduce((result, image) => {
      if (!result[image.product_id] || image.is_primary) {
        result[image.product_id] = image;
      }
      return result;
    }, {});

    return {
      rootCategory,
      filters,
      counts,
      products: products.map((product) => ({
        ...product,
        category_ids: categoryIdsByProductId[product.id] || [],
        image: buildAssetUrl(primaryImages[product.id]),
        alt: primaryImages[product.id]?.alt || product.name,
      })),
    };
  }

  window.CategoryService = {
    getKhayListing: () => getCategoryListing('khay'),
    getCategoryListing,
  };
})();
