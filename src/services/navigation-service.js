(function () {
  function hasSupabaseConfig() {
    return Boolean(window.AppConfig?.supabaseUrl && window.AppConfig?.supabasePublishableKey);
  }

  function buildAssetUrl(storageKey) {
    if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !storageKey) return '';
    return `${baseUrl}/${storageKey.replace(/^\//, '')}`;
  }

  function getImageUrl(image) {
    if (!image) return '';
    if (image.public_url) return image.public_url;
    return buildAssetUrl(image.storage_key);
  }

  function getSupabaseHeaders() {
    const publishableKey = window.AppConfig.supabasePublishableKey;
    const headers = {
      apikey: publishableKey,
      'Content-Type': 'application/json',
    };

    // Legacy anon keys are JWTs. New sb_publishable_* keys should be sent as apikey.
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

  function getDescendantIds(categoryId, childrenByParentId) {
    const directChildren = childrenByParentId[categoryId] || [];
    return directChildren.reduce((result, child) => {
      return [...result, child.id, ...getDescendantIds(child.id, childrenByParentId)];
    }, []);
  }

  async function buildCategoryMetrics(items) {
    const categoryItemIds = [...new Set(
      items
        .filter((item) => item.category_id)
        .map((item) => item.category_id),
    )];

    if (!categoryItemIds.length) return {};

    const categories = await fetchJson(
      'categories?select=id,name,slug,parent_id,is_active&is_active=eq.true&order=sort_order.asc',
    );
    const categoryById = categories.reduce((result, category) => ({
      ...result,
      [category.id]: category,
    }), {});
    const childrenByParentId = categories.reduce((result, category) => {
      if (!result[category.parent_id]) result[category.parent_id] = [];
      result[category.parent_id].push(category);
      return result;
    }, {});
    const categoryIdsByMenuCategoryId = categoryItemIds.reduce((result, categoryId) => ({
      ...result,
      [categoryId]: [categoryId, ...getDescendantIds(categoryId, childrenByParentId)],
    }), {});
    const allMetricCategoryIds = [...new Set(Object.values(categoryIdsByMenuCategoryId).flat())];

    if (!allMetricCategoryIds.length) return {};

    const relations = await fetchJson(
      `product_categories?select=product_id,category_id&category_id=in.(${allMetricCategoryIds.join(',')})`,
    );
    const relationProductIds = [...new Set(relations.map((relation) => relation.product_id))];
    const productById = {};
    const productsByCategoryId = {};

    if (relationProductIds.length) {
      const products = await fetchJson(
        `products?select=id,name,slug,category_id,status,created_at&status=eq.published&id=in.(${relationProductIds.join(',')})&order=created_at.desc`,
      );
      products.forEach((product) => {
        productById[product.id] = product;
      });
    }

    const directProducts = await fetchJson(
      `products?select=id,name,slug,category_id,status,created_at&status=eq.published&category_id=in.(${allMetricCategoryIds.join(',')})&order=created_at.desc`,
    );
    directProducts.forEach((product) => {
      productById[product.id] = product;
      if (!productsByCategoryId[product.category_id]) productsByCategoryId[product.category_id] = [];
      productsByCategoryId[product.category_id].push(product.id);
    });

    relations.forEach((relation) => {
      if (!productById[relation.product_id]) return;
      if (!productsByCategoryId[relation.category_id]) productsByCategoryId[relation.category_id] = [];
      if (!productsByCategoryId[relation.category_id].includes(relation.product_id)) {
        productsByCategoryId[relation.category_id].push(relation.product_id);
      }
    });

    const allProductIds = Object.keys(productById);
    const images = allProductIds.length
      ? await fetchJson(
        `product_images?select=product_id,storage_key,public_url,is_primary,sort_order&product_id=in.(${allProductIds.join(',')})&order=sort_order.asc`,
      )
      : [];
    const imagesByProductId = images.reduce((result, image) => {
      if (!result[image.product_id]) result[image.product_id] = [];
      result[image.product_id].push(image);
      return result;
    }, {});

    return categoryItemIds.reduce((result, categoryId) => {
      const metricCategoryIds = categoryIdsByMenuCategoryId[categoryId] || [categoryId];
      const productIds = [...new Set(metricCategoryIds.flatMap((id) => productsByCategoryId[id] || []))];
      const firstProductId = productIds[0];
      const productImages = imagesByProductId[firstProductId] || [];
      const image = productImages.find((item) => item.is_primary) || productImages[0];
      const category = categoryById[categoryId];

      result[categoryId] = {
        href: category ? `#category/${category.slug}` : '#',
        count: productIds.length,
        image: getImageUrl(image),
      };
      return result;
    }, {});
  }

  async function normalizeGroups(groups, items) {
    const itemsByGroupId = items.reduce((result, item) => {
      if (!result[item.group_id]) result[item.group_id] = [];
      result[item.group_id].push(item);
      return result;
    }, {});
    const metricsByCategoryId = await buildCategoryMetrics(items);

    return groups.map((group) => ({
      id: group.id,
      title: group.title,
      slug: group.slug,
      image: buildAssetUrl(group.image_storage_key),
      items: (itemsByGroupId[group.id] || []).map((item) => ({
        id: item.id,
        label: item.label,
        href: item.category_id ? metricsByCategoryId[item.category_id]?.href || item.href || '#' : item.href || '#',
        isHeading: item.is_heading,
        itemType: item.item_type,
        categoryId: item.category_id,
        pageId: item.page_id,
        productCount: item.category_id ? metricsByCategoryId[item.category_id]?.count || 0 : null,
        image: buildAssetUrl(item.image_storage_key)
          || (item.category_id ? metricsByCategoryId[item.category_id]?.image : '')
          || buildAssetUrl(group.image_storage_key),
      })),
    }));
  }

  async function getNavigationItems(groupIds) {
    try {
      return await fetchJson(
        `navigation_items?select=id,group_id,label,item_type,href,category_id,page_id,image_storage_key,is_heading,sort_order,is_active&is_active=eq.true&group_id=in.(${groupIds})&order=sort_order.asc`,
      );
    } catch (error) {
      console.warn('navigation_items image columns are not available yet, using fallback query.', error);
      return fetchJson(
        `navigation_items?select=id,group_id,label,item_type,href,category_id,page_id,is_heading,sort_order,is_active&is_active=eq.true&group_id=in.(${groupIds})&order=sort_order.asc`,
      );
    }
  }

  async function getNavigationGroups() {
    if (!hasSupabaseConfig()) return [];

    try {
      const groups = await fetchJson(
        'navigation_groups?select=id,title,slug,image_storage_key,sort_order,is_active&is_active=eq.true&order=sort_order.asc',
      );

      if (!groups.length) return [];

      const groupIds = groups.map((group) => group.id).join(',');
      const items = await getNavigationItems(groupIds);

      return normalizeGroups(groups, items);
    } catch (error) {
      console.warn(error);
      return [];
    }
  }

  window.NavigationService = {
    getNavigationGroups,
  };
})();
