begin;

-- Header navigation groups.
-- image_storage_key points to Cloudflare R2 object keys.
-- Replace these keys with your real R2 paths after uploading images.
insert into navigation_groups (
  title,
  slug,
  image_storage_provider,
  image_storage_bucket,
  image_storage_key,
  sort_order,
  is_active
)
values
  ('BUY MORE SAVE MORE', 'buy-more-save-more', 'cloudflare_r2', 'anhuy-assets', 'navigation/buy-more-save-more.webp', 10, true),
  ('END OF SEASON SALE', 'end-of-season-sale', 'cloudflare_r2', 'anhuy-assets', 'navigation/end-of-season-sale.webp', 20, true),
  ('Hàng mới', 'hang-moi', 'cloudflare_r2', 'anhuy-assets', 'navigation/hang-moi.webp', 30, true),
  ('Quà tặng', 'qua-tang', 'cloudflare_r2', 'anhuy-assets', 'navigation/qua-tang.webp', 40, true),
  ('Trang trí nhà', 'trang-tri-nha', 'cloudflare_r2', 'anhuy-assets', 'navigation/trang-tri-nha.webp', 50, true),
  ('Về An Huy', 've-an-huy', 'cloudflare_r2', 'anhuy-assets', 'navigation/ve-an-huy.webp', 60, true)
on conflict (slug) do update set
  title = excluded.title,
  image_storage_provider = excluded.image_storage_provider,
  image_storage_bucket = excluded.image_storage_bucket,
  image_storage_key = excluded.image_storage_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

delete from navigation_items
where group_id in (
  select id
  from navigation_groups
  where slug in (
    'buy-more-save-more',
    'end-of-season-sale',
    'hang-moi',
    'qua-tang',
    'trang-tri-nha',
    've-an-huy'
  )
);

with groups as (
  select id, slug
  from navigation_groups
  where slug in (
    'buy-more-save-more',
    'end-of-season-sale',
    'hang-moi',
    'qua-tang',
    'trang-tri-nha',
    've-an-huy'
  )
)
insert into navigation_items (
  group_id,
  label,
  item_type,
  href,
  category_id,
  page_id,
  is_heading,
  sort_order,
  is_active
)
select id, 'Trang trí nhà cửa', 'link', '#', null::uuid, null::uuid, false, 10, true
from groups where slug = 'end-of-season-sale'
union all
select id, '-30%', 'link', '#', null::uuid, null::uuid, false, 20, true
from groups where slug = 'end-of-season-sale'
union all
select id, '-40%', 'link', '#', null::uuid, null::uuid, false, 30, true
from groups where slug = 'end-of-season-sale'
union all
select id, '-50%', 'link', '#', null::uuid, null::uuid, false, 40, true
from groups where slug = 'end-of-season-sale'

union all
select id, 'Trang trí nhà', 'link', '#', null::uuid, null::uuid, true, 10, true
from groups where slug = 'hang-moi'
union all
select id, 'FW2026 : Nét tỉ mỉ trong sơn mài', 'link', '#', null::uuid, null::uuid, false, 20, true
from groups where slug = 'hang-moi'
union all
select id, 'FW2026 : Sắc độ phân tầng', 'link', '#', null::uuid, null::uuid, false, 30, true
from groups where slug = 'hang-moi'
union all
select id, 'SS2026 : Mã khai niên', 'link', '#', null::uuid, null::uuid, false, 40, true
from groups where slug = 'hang-moi'
union all
select id, 'Thời trang', 'link', '#', null::uuid, null::uuid, true, 50, true
from groups where slug = 'hang-moi'
union all
select id, 'AnHuyx COMAY | GIỮA HAI MIỀN SÁNG TẠO', 'link', '#', null::uuid, null::uuid, false, 60, true
from groups where slug = 'hang-moi'

union all
select id, 'Quà tặng theo dịp', 'link', '#', null::uuid, null::uuid, false, 10, true
from groups where slug = 'qua-tang'
union all
select id, 'Quà tặng theo người nhận', 'link', '#', null::uuid, null::uuid, false, 20, true
from groups where slug = 'qua-tang'
union all
select id, 'Quà tặng doanh nghiệp', 'link', '#', null::uuid, null::uuid, false, 30, true
from groups where slug = 'qua-tang'

union all
select id, 'Đồ trang trí', 'link', '#', null::uuid, null::uuid, true, 10, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Bình hoa', 'link', '#', null::uuid, null::uuid, false, 20, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Hộp trà, Hộp mứt tết', 'link', '#', null::uuid, null::uuid, false, 30, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Khay', 'link', '#category/khay', null::uuid, null::uuid, false, 40, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Tranh, khung ảnh', 'link', '#', null::uuid, null::uuid, false, 50, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Dụng cụ pha trà cafe', 'link', '#', null::uuid, null::uuid, false, 60, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Nội thất', 'link', '#', null::uuid, null::uuid, true, 70, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Bàn', 'link', '#', null::uuid, null::uuid, false, 80, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Ghế', 'link', '#', null::uuid, null::uuid, false, 90, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Tủ kệ giường', 'link', '#', null::uuid, null::uuid, false, 100, true
from groups where slug = 'trang-tri-nha'
union all
select id, 'Đèn bàn, Đèn treo tường', 'link', '#', null::uuid, null::uuid, false, 110, true
from groups where slug = 'trang-tri-nha'

union all
select id, 'Niềm đam mê', 'link', '#passion', null::uuid, null::uuid, false, 10, true
from groups where slug = 've-an-huy'
union all
select id, 'Nghệ thuật sơn mài', 'link', '#', null::uuid, null::uuid, false, 20, true
from groups where slug = 've-an-huy';

commit;
