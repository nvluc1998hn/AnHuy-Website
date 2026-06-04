begin;

-- Product/category relation allows one product to belong to multiple filters,
-- for example: Khay + Khay sơn mài + Khay tròn.
create table if not exists product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (product_id, category_id)
);

create index if not exists idx_product_categories_category_id on product_categories(category_id);

insert into categories (name, slug, parent_id, sort_order, is_active)
values ('Trang trí nhà', 'trang-tri-nha', null, 10, true)
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into categories (name, slug, parent_id, sort_order, is_active)
select 'Khay', 'khay', id, 20, true
from categories
where slug = 'trang-tri-nha'
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into categories (name, slug, parent_id, sort_order, is_active)
select item.name, item.slug, parent.id, item.sort_order, true
from categories parent
cross join (
  values
    ('Khay sơn mài', 'khay-son-mai', 10),
    ('Khay tròn', 'khay-tron', 20),
    ('Khay chữ nhật', 'khay-chu-nhat', 30),
    ('Khay chia ngăn', 'khay-chia-ngan', 40)
) as item(name, slug, sort_order)
where parent.slug = 'khay'
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

insert into products (
  name,
  slug,
  description,
  price,
  collection,
  material,
  size,
  status,
  is_featured,
  sort_order
)
values
  ('Khay tròn hoa sen', 'khay-tron-hoa-sen', 'Khay tròn sơn mài họa tiết hoa sen, phù hợp bàn trà và không gian tiếp khách.', 2450000, 'Botanica', 'Sơn mài trên vóc gỗ', 'Đường kính 28 cm', 'published', true, 10),
  ('Khay chữ nhật hoa cúc', 'khay-chu-nhat-hoa-cuc', 'Khay chữ nhật sơn mài hoa cúc, hoàn thiện thủ công với sắc vàng trang nhã.', 2950000, 'Botanica', 'Sơn mài trên vóc gỗ', '32 x 22 cm', 'published', true, 20),
  ('Khay chữ nhật sen vàng', 'khay-chu-nhat-sen-vang', 'Khay chữ nhật tay cầm kim loại, họa tiết sen vàng nổi bật trên nền đen.', 3450000, 'Lotus', 'Sơn mài, tay cầm kim loại', '36 x 26 cm', 'published', false, 30),
  ('Khay chia ngăn mai vàng', 'khay-chia-ngan-mai-vang', 'Khay chia ngăn tiện dụng, phù hợp bày mứt, trà và vật dụng trang trí nhỏ.', 2750000, 'Golden Apricot', 'Sơn mài trên vóc gỗ', '30 x 30 cm', 'published', false, 40)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  collection = excluded.collection,
  material = excluded.material,
  size = excluded.size,
  status = excluded.status,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  updated_at = now();

delete from product_categories
where product_id in (
  select id from products where slug in (
    'khay-tron-hoa-sen',
    'khay-chu-nhat-hoa-cuc',
    'khay-chu-nhat-sen-vang',
    'khay-chia-ngan-mai-vang'
  )
);

with product_map as (
  select p.id as product_id, c.id as category_id
  from products p
  join categories c on c.slug in ('khay', 'khay-son-mai')
  where p.slug in ('khay-tron-hoa-sen', 'khay-chu-nhat-hoa-cuc', 'khay-chu-nhat-sen-vang', 'khay-chia-ngan-mai-vang')
  union all
  select p.id, c.id
  from products p
  join categories c on c.slug = 'khay-tron'
  where p.slug = 'khay-tron-hoa-sen'
  union all
  select p.id, c.id
  from products p
  join categories c on c.slug = 'khay-chu-nhat'
  where p.slug in ('khay-chu-nhat-hoa-cuc', 'khay-chu-nhat-sen-vang')
  union all
  select p.id, c.id
  from products p
  join categories c on c.slug = 'khay-chia-ngan'
  where p.slug = 'khay-chia-ngan-mai-vang'
)
insert into product_categories (product_id, category_id)
select product_id, category_id
from product_map
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
select p.id, 'cloudflare_r2', 'anhuy-assets', image.storage_key, p.name, true, 10
from products p
join (
  values
    ('khay-tron-hoa-sen', 'products/khay-tron-hoa-sen/main.webp'),
    ('khay-chu-nhat-hoa-cuc', 'products/khay-chu-nhat-hoa-cuc/main.webp'),
    ('khay-chu-nhat-sen-vang', 'products/khay-chu-nhat-sen-vang/main.webp'),
    ('khay-chia-ngan-mai-vang', 'products/khay-chia-ngan-mai-vang/main.webp')
) as image(slug, storage_key) on image.slug = p.slug
where not exists (
  select 1
  from product_images pi
  where pi.product_id = p.id
    and pi.storage_key = image.storage_key
);

commit;
