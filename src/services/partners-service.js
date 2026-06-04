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

  function buildAssetUrl(storageKey) {
    if (/^https?:\/\//i.test(storageKey || '')) return storageKey;
    const publicBaseUrl = window.AppConfig?.r2PublicBaseUrl?.replace(/\/$/, '');
    const cdnBaseUrl = window.AppConfig?.cdnBaseUrl?.replace(/\/$/, '');
    const baseUrl = publicBaseUrl || cdnBaseUrl;
    if (!baseUrl || !storageKey) return '';
    return `${baseUrl}/${storageKey.replace(/^\//, '')}`;
  }

  async function getPartners() {
    if (!hasSupabaseConfig()) return [];

    try {
      const partners = await fetchJson(
        'partners?select=id,name,image_storage_key,alt,sort_order,is_active&is_active=eq.true&order=sort_order.asc',
      );

      return (partners || []).map((partner) => ({
        id: partner.id,
        name: partner.name,
        alt: partner.alt || partner.name,
        image: buildAssetUrl(partner.image_storage_key),
      }));
    } catch (error) {
      console.warn(error);
      return [];
    }
  }

  window.PartnersService = {
    getPartners,
  };
})();
