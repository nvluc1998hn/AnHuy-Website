(function () {
const { passionPage } = window.SiteData;
const PassionIcon = window.Icon;

function PassionDetail() {
  return (
    <section className="passion-page">
      <div className="passion-hero reveal is-visible">
        <img src={passionPage.heroImage} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
        <div className="passion-hero-copy">
          <div className="passion-eyebrow">
            <PassionIcon name="flower" size={34} />
            <span>{passionPage.eyebrow}</span>
          </div>
          <h1>{passionPage.title}</h1>
          <i />
          {passionPage.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="passion-journey">
        <div className="passion-heading">
          <span />
          <h2>{passionPage.journeyTitle}</h2>
          <span />
        </div>

        <div className="journey-grid">
          {passionPage.steps.map((step, index) => (
            <article className="journey-card reveal is-visible" key={step.title}>
              <div className="journey-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <div className="journey-image">
                <img src={step.image} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
              </div>
              <p>{step.body}</p>
              <div className="journey-icon">
                <span />
                <PassionIcon name={step.icon} size={28} />
                <span />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="passion-quote reveal is-visible">
        <img src={passionPage.quoteImage} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
        <blockquote>{passionPage.quote}</blockquote>
      </div>
    </section>
  );
}

window.PassionDetail = PassionDetail;
})();
