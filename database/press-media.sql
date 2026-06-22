-- ============================================================================
-- press_media: bài báo & video báo chí / truyền thông nói về An Huy.
-- Hiển thị ở section "Báo chí nói về An Huy" cuối trang chủ.
-- Chạy file này trên Supabase sau khi đã chạy schema.sql (cần hàm set_updated_at()).
-- ============================================================================

create table if not exists press_media (
  id uuid primary key default gen_random_uuid(),
  media_type text not null default 'article' check (media_type in ('article', 'video')),
  title text not null,
  source_name text,            -- tên báo / kênh (vd: VTV, VnExpress)
  url text not null,           -- link bài viết hoặc video (YouTube / Facebook / báo)
  thumbnail_url text,          -- ảnh đại diện (URL đầy đủ hoặc storage key trên R2/CDN)
  published_at date,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_press_media_active on press_media(is_active, sort_order);

drop trigger if exists trg_press_media_updated_at on press_media;
create trigger trg_press_media_updated_at before update on press_media
for each row execute function set_updated_at();

-- RLS: công khai chỉ đọc bản ghi đang bật; người đăng nhập (admin) toàn quyền CRUD.
alter table press_media enable row level security;
grant select, insert, update, delete on public.press_media to authenticated;

drop policy if exists "Public can read active press media" on press_media;
create policy "Public can read active press media"
on press_media for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can insert press media" on press_media;
create policy "Admins can insert press media"
on press_media for insert to authenticated with check (true);

drop policy if exists "Admins can update press media" on press_media;
create policy "Admins can update press media"
on press_media for update to authenticated using (true) with check (true);

drop policy if exists "Admins can delete press media" on press_media;
create policy "Admins can delete press media"
on press_media for delete to authenticated using (true);

-- Dữ liệu mẫu (chỉ chèn khi bảng còn trống — chạy lại nhiều lần không bị trùng).
insert into press_media (media_type, title, source_name, url, thumbnail_url, published_at, sort_order)
select * from (values
  ('video',   'Sơn Mài An Huy - Tinh hoa nghề thủ công Việt', 'VTV',       'https://www.youtube.com/watch?v=dQw4w9WgXcQ', null::text, '2025-03-12'::date, 10),
  ('article', 'An Huy đưa sơn mài Việt ra thế giới',          'VnExpress', 'https://vnexpress.net/',                      null::text, '2025-01-20'::date, 20)
) as seed(media_type, title, source_name, url, thumbnail_url, published_at, sort_order)
where not exists (select 1 from press_media);
