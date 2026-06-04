(function () {
  const STORAGE_KEY = 'anhuy_admin_session';

  function hasConfig() {
    return Boolean(window.AppConfig?.supabaseUrl && window.AppConfig?.supabasePublishableKey);
  }

  function getBaseUrl() {
    return window.AppConfig.supabaseUrl.replace(/\/$/, '');
  }

  function getHeaders() {
    return {
      apikey: window.AppConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    };
  }

  function saveSession(session) {
    const value = {
      ...session,
      expires_at: Date.now() + Number(session.expires_in || 3600) * 1000,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return value;
  }

  function getSession() {
    try {
      const session = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!session?.access_token) return null;
      if (session.expires_at && session.expires_at < Date.now()) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch (error) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  async function signIn(email, password) {
    if (!hasConfig()) throw new Error('Supabase config is missing.');

    const response = await fetch(`${getBaseUrl()}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error_description || error.msg || 'Login failed.');
    }

    return saveSession(await response.json());
  }

  function signOut() {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function getAccessToken() {
    return getSession()?.access_token || '';
  }

  window.AuthService = {
    getAccessToken,
    getSession,
    signIn,
    signOut,
  };
})();
