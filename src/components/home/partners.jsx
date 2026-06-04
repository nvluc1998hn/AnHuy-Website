(function () {
const { useEffect: partnersUseEffect, useState: partnersUseState } = React;

function getPartnerVisibleLimit(width = window.innerWidth) {
  if (width <= 820) return 1;
  if (width <= 1180) return 5;
  return 6;
}

function PartnerLogo({ partner, duplicate }) {
  return (
    <div className="partner-logo" key={partner.id || partner.name} title={partner.name} aria-hidden={duplicate ? 'true' : undefined}>
      <img src={partner.image} alt={duplicate ? '' : partner.alt || partner.name} loading="lazy" onError={(event) => event.currentTarget.closest('.partner-logo').classList.add('empty')} />
      <strong>{partner.name}</strong>
    </div>
  );
}

function PartnersSection() {
  const [partners, setPartners] = partnersUseState([]);
  const [shouldMarquee, setShouldMarquee] = partnersUseState(false);
  const [viewportWidth, setViewportWidth] = partnersUseState(() => window.innerWidth);

  partnersUseEffect(() => {
    let active = true;
    if (!window.PartnersService?.getPartners) return () => {};

    window.PartnersService.getPartners()
      .then((items) => {
        if (active) setPartners(Array.isArray(items) ? items : []);
      })
      .catch((error) => console.warn(error));

    return () => {
      active = false;
    };
  }, []);

  partnersUseEffect(() => {
    function updateMarqueeMode() {
      const width = window.innerWidth;
      setViewportWidth(width);
      setShouldMarquee(partners.length > getPartnerVisibleLimit(width));
    }

    updateMarqueeMode();
    window.addEventListener('resize', updateMarqueeMode);
    return () => window.removeEventListener('resize', updateMarqueeMode);
  }, [partners.length]);

  if (!partners.length) return null;

  const displayPartners = shouldMarquee ? [...partners, ...partners] : partners;
  const marqueeDuration = `${Math.max(viewportWidth <= 820 ? 14 : 24, partners.length * (viewportWidth <= 820 ? 2.6 : 4))}s`;

  return (
    <section className="partners-section">
      <div className="partners-shell reveal">
        <div className="partners-title">
          <span />
          <i>
            <window.Icon name="flower" size={14} />
          </i>
          <h2>Đối tác của An Huy</h2>
          <i>
            <window.Icon name="flower" size={14} />
          </i>
          <span />
        </div>

        <div
          className={`partners-list ${shouldMarquee ? 'is-marquee' : ''}`}
          style={shouldMarquee ? { '--partner-marquee-duration': marqueeDuration } : undefined}
        >
          <div className="partners-track">
            {displayPartners.map((partner, index) => (
              <PartnerLogo
                partner={partner}
                duplicate={shouldMarquee && index >= partners.length}
                key={`${partner.id || partner.name}-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.PartnersSection = PartnersSection;
})();
