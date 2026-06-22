(function () {
const { useEffect: pressUseEffect, useState: pressUseState } = React;
const PressIcon = window.Icon;

// Chuyển link xem video sang link nhúng (iframe). Trả '' nếu không nhúng được
// → khi đó mở link gốc ở tab mới thay vì lightbox.
function toEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (host.endsWith('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
      if (parsed.pathname.startsWith('/shorts/')) {
        return `https://www.youtube.com/embed/${parsed.pathname.split('/')[2] || ''}`;
      }
    }
    if (host.endsWith('facebook.com') || host === 'fb.watch') {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
    }
  } catch (error) {
    return '';
  }
  return '';
}

function PressMedia() {
  const [items, setItems] = pressUseState([]);
  const [active, setActive] = pressUseState(null);

  pressUseEffect(() => {
    let alive = true;
    if (!window.PressMediaService?.getPressMedia) return () => {};

    window.PressMediaService.getPressMedia()
      .then((data) => {
        if (alive && Array.isArray(data)) setItems(data);
      })
      .catch((error) => console.warn(error));

    return () => {
      alive = false;
    };
  }, []);

  pressUseEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setActive(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active]);

  if (!items.length) return null;

  function openItem(item) {
    const embed = item.type === 'video' ? toEmbedUrl(item.url) : '';
    if (embed) {
      setActive({ ...item, embed });
    } else {
      window.open(item.url, '_blank', 'noopener');
    }
  }

  return (
    <section className="section press-media">
      <div className="press-media-head reveal">
        <span className="press-media-mark">
          <PressIcon name="newspaper" size={18} />
        </span>
        <h2>Báo chí nói về An Huy</h2>
        <span className="press-media-line" />
        <p>Những ghi nhận và chia sẻ từ báo chí, truyền thông về Sơn Mài An Huy.</p>
      </div>

      <div className="press-media-grid">
        {items.map((item, index) => (
          <article className="press-card reveal" key={item.id} style={{ transitionDelay: `${index * 55}ms` }}>
            <button
              type="button"
              className={`press-card-media ${item.type}`}
              onClick={() => openItem(item)}
              aria-label={item.title}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  onError={(event) => event.currentTarget.closest('.press-card-media').classList.add('image-fallback')}
                />
              ) : (
                <span className="press-card-placeholder">ANHUY</span>
              )}
              <span className="press-card-badge">
                <PressIcon name={item.type === 'video' ? 'play' : 'external'} size={item.type === 'video' ? 22 : 18} />
              </span>
              <span className="press-card-type">{item.type === 'video' ? 'Video' : 'Bài báo'}</span>
            </button>

            <div className="press-card-body">
              {item.source && <span className="press-card-source">{item.source}</span>}
              <h3>
                <button type="button" onClick={() => openItem(item)}>{item.title}</button>
              </h3>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="press-lightbox" onClick={() => setActive(null)}>
          <button
            type="button"
            className="press-lightbox-close"
            aria-label="Đóng"
            onClick={() => setActive(null)}
          >
            ×
          </button>
          <div className="press-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <iframe
              src={active.embed}
              title={active.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

window.PressMedia = PressMedia;
})();
