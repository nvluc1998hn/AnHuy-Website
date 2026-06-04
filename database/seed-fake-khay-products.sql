begin;

delete from products
where slug like 'fake-khay-%';

with root_category as (
  select id
  from categories
  where slug = 'khay'
  limit 1
),
fake_products as (
  select
    n,
    case (n - 1) % 4
      when 0 then 'Khay tròn'
      when 1 then 'Khay chữ nhật'
      when 2 then 'Khay chia ngăn'
      else 'Khay sơn mài'
    end as type_name,
    case (n - 1) % 4
      when 0 then 'khay-tron'
      when 1 then 'khay-chu-nhat'
      when 2 then 'khay-chia-ngan'
      else 'khay-son-mai'
    end as type_slug,
    case n % 5
      when 0 then 'Botanica'
      when 1 then 'Lotus'
      when 2 then 'Golden Apricot'
      when 3 then 'Heritage'
      else 'Mountain'
    end as collection_name
  from generate_series(1, 50) as item(n)
)
insert into products (
  category_id,
  name,
  slug,
  description,
  price,
  collection,
  material,
  size,
  status,
  is_featured,
  sort_order,
  created_at
)
select
  root_category.id,
  fake_products.type_name || ' mẫu thử ' || lpad(fake_products.n::text, 2, '0'),
  'fake-khay-' || lpad(fake_products.n::text, 3, '0'),
  'Sản phẩm dữ liệu mẫu dùng để kiểm tra danh sách, bộ lọc, sắp xếp và lazy loading.',
  1200000 + (fake_products.n * 85000),
  fake_products.collection_name,
  'Sơn mài trên vóc gỗ',
  case fake_products.type_slug
    when 'khay-tron' then 'Đường kính 28 cm'
    when 'khay-chu-nhat' then '32 x 22 cm'
    when 'khay-chia-ngan' then '30 x 30 cm'
    else '28 x 18 cm'
  end,
  'published',
  fake_products.n <= 8,
  fake_products.n,
  now() - (fake_products.n || ' hours')::interval
from fake_products
cross join root_category
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  collection = excluded.collection,
  material = excluded.material,
  size = excluded.size,
  status = excluded.status,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  created_at = excluded.created_at,
  updated_at = now();

with fake_products as (
  select
    p.id as product_id,
    p.slug as product_slug,
    case (replace(p.slug, 'fake-khay-', '')::int - 1) % 4
      when 0 then 'khay-tron'
      when 1 then 'khay-chu-nhat'
      when 2 then 'khay-chia-ngan'
      else 'khay-son-mai'
    end as type_slug
  from products p
  where p.slug like 'fake-khay-%'
),
category_map as (
  select fake_products.product_id, categories.id as category_id
  from fake_products
  join categories on categories.slug = 'khay'

  union all

  select fake_products.product_id, categories.id
  from fake_products
  join categories on categories.slug = fake_products.type_slug
)
insert into product_categories (product_id, category_id)
select product_id, category_id
from category_map
on conflict (product_id, category_id) do nothing;

insert into product_images (
  product_id,
  storage_provider,
  storage_bucket,
  storage_key,
  alt,
  is_primary,
  sort_order
)
select
  products.id,
  'cloudflare_r2',
  'anhuy-assets',
  'products/fake-khay/' || products.slug || '/gallery-' || image_index.n || '.webp',
  products.name || ' - ảnh ' || image_index.n,
  image_index.n = 1,
  image_index.n * 10
from products
cross join generate_series(1, 4) as image_index(n)
where products.slug like 'fake-khay-%'
on conflict do nothing;

commit;
