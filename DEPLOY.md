# Deploy AnHuy Website

## Netlify

Build settings:

- Build command: để trống
- Publish directory: `.`
- Functions directory: `netlify/functions`

Environment variables cần thêm trong Netlify:

```txt
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
CLOUDFLARE_ACCOUNT_ID=xxx
R2_BUCKET_NAME=anhuy-image
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_PUBLIC_BASE_URL=https://pub-xxx.r2.dev
```

`SUPABASE_PUBLISHABLE_KEY` là key public dùng để Netlify Function xác thực access token của admin trước khi xóa ảnh trên R2. Nếu thiếu biến này, các thao tác xóa ảnh sẽ báo lỗi server auth config.

`/api/r2-presign`, `/api/r2-delete`, `/api/env-status` sẽ được route qua Netlify Functions nhờ `netlify.toml`.

## Cloudflare R2 CORS

Thêm domain Netlify vào CORS của bucket R2:

```json
[
  {
    "AllowedOrigins": ["https://your-site.netlify.app"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Node host thường

Nếu host hỗ trợ Node.js:

```bash
npm start
```

Server sẽ đọc `.env`, dùng `PORT` của host và bind `HOST=0.0.0.0` mặc định.
