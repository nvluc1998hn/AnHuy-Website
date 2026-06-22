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

  async function getPressMedia() {
    if (!hasSupabaseConfig()) return [];

    const rows = await fetchJson(
      'press_media?select=id,media_type,title,source_name,url,thumbnail_url,published_at,sort_order&is_active=eq.true&order=sort_order.asc',
    );

    return rows
      .filter((row) => row.url)
      .map((row) => ({
        id: row.id,
        type: row.media_type === 'video' ? 'video' : 'article',
        title: row.title || 'Báo chí nói về An Huy',
        source: row.source_name || '',
        url: row.url,
        thumbnail: buildAssetUrl(row.thumbnail_url),
        publishedAt: row.published_at || '',
      }));
  }

  window.PressMediaService = {
    getPressMedia,
  };
})();
