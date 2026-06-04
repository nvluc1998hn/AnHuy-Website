(function () {
  const MAX_IMAGE_EDGE = 1800;
  const WEBP_QUALITY = 0.82;
  const OPTIMIZE_THRESHOLD = 1.2 * 1024 * 1024;

  function formatBytes(bytes) {
    if (!bytes) return '0KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  function getOptimizedName(fileName) {
    return String(fileName || 'image')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() + '.webp';
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Không đọc được ảnh.'));
      };
      image.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Không nén được ảnh.'));
      }, type, quality);
    });
  }

  async function optimizeImage(file) {
    if (!file.type?.startsWith('image/')) return file;

    const image = await loadImage(file);
    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
    const shouldResize = longestEdge > MAX_IMAGE_EDGE;
    const shouldCompress = file.size > OPTIMIZE_THRESHOLD;

    if (!shouldResize && !shouldCompress && file.type === 'image/webp') {
      return file;
    }

    const scale = shouldResize ? MAX_IMAGE_EDGE / longestEdge : 1;
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
    if (blob.size >= file.size) return file;

    return new File([blob], getOptimizedName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  }

  // Two-step upload:
  //   1. Optimize large images in-browser.
  //   2. Ask our server for a Sigv4 presigned PUT URL.
  //   3. PUT the optimized file straight to Cloudflare R2.
  async function uploadImage(file, folder = 'products') {
    if (!file) throw new Error('Vui lòng chọn ảnh.');

    const uploadFile = await optimizeImage(file);
    const presignResponse = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.AuthService.getAccessToken()}`,
      },
      body: JSON.stringify({
        file_name: uploadFile.name,
        content_type: uploadFile.type || 'application/octet-stream',
        folder,
      }),
    });
    const presign = await presignResponse.json().catch(() => ({}));
    if (!presignResponse.ok) {
      throw new Error(presign.error || 'Không xin được URL upload.');
    }

    const uploadResponse = await fetch(presign.upload_url, {
      method: 'PUT',
      body: uploadFile,
    });
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '');
      throw new Error(`Upload ảnh thất bại (${uploadResponse.status}). ${errorText}`);
    }

    return {
      storage_key: presign.storage_key,
      public_url: presign.public_url,
      bucket: presign.bucket,
      original_size: file.size,
      upload_size: uploadFile.size,
      size_label: `${formatBytes(file.size)} -> ${formatBytes(uploadFile.size)}`,
      optimized: uploadFile.size < file.size,
    };
  }

  window.R2UploadService = {
    uploadImage,
  };
})();
