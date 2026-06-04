(function () {
  function getBaseUrl() {
    return window.AppConfig.supabaseUrl.replace(/\/$/, '');
  }

  function getHeaders(extra = {}) {
    return {
      apikey: window.AppConfig.supabasePublishableKey,
      Authorization: `Bearer ${window.AuthService.getAccessToken()}`,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${getBaseUrl()}/rest/v1/${path}`, {
      ...options,
      headers: getHeaders(options.headers),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Supabase request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function buildAssetUrl(storageKey) {
    if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !storageKey) return '';
    return `${baseUrl}/${storageKey.replace(/^\//, '')}`;
  }

  async function deleteFromR2(storageKey) {
    if (!storageKey || /^https?:\/\//i.test(storageKey)) return;

    const response = await fetch('/api/r2-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.AuthService.getAccessToken()}`,
      },
      body: JSON.stringify({ storage_key: storageKey }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Không xóa được logo trên Cloudflare.');
    }
  }

  async function getPartners() {
    const partners = await fetchJson(
      'partners?select=id,name,image_storage_bucket,image_storage_key,alt,sort_order,is_active,created_at,updated_at&order=sort_order.asc',
    );

    return (partners || []).map((partner) => ({
      ...partner,
      image_url: buildAssetUrl(partner.image_storage_key),
    }));
  }

  async function savePartner(form) {
    const body = {
      name: form.name,
      image_storage_provider: 'cloudflare_r2',
      image_storage_bucket: form.image_storage_bucket || 'anhuy-image',
      image_storage_key: form.image_storage_key,
      alt: form.alt || form.name,
      sort_order: Number(form.sort_order || 0),
      is_active: Boolean(form.is_active),
    };

    return form.id
      ? (await fetchJson(`partners?id=eq.${form.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0]
      : (await fetchJson('partners', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify(body),
        }))[0];
  }

  async function deletePartner(partner) {
    await deleteFromR2(partner.image_storage_key);

    const deletedRows = await fetchJson(`partners?id=eq.${partner.id}&select=id,name`, {
      method: 'DELETE',
      headers: { Prefer: 'return=representation' },
    });

    if (!deletedRows?.length) throw new Error('Không xóa được đối tác.');
    return deletedRows[0];
  }

  window.AdminPartnerService = {
    deleteLogo: deleteFromR2,
    deletePartner,
    getPartners,
    savePartner,
  };
})();
