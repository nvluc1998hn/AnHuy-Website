(function () {
const { useEffect: heroUseEffect, useState: heroUseState } = React;
const heroSlides = Array.isArray(window.SiteData?.heroSlides) ? window.SiteData.heroSlides : [];
const HeroIcon = window.Icon;

function Hero() {
  const [active, setActive] = heroUseState(0);

  heroUseEffect(() => {
    if (!heroSlides.length) return () => {};
    const timer = window.setInterval(() => setActive((index) => (index + 1) % heroSlides.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  if (!heroSlides.length) return null;

  const slide = heroSlides[active];

  return (
    <section className="hero">
      {heroSlides.map((item, index) => (
        <picture key={item.title} className={`hero-picture ${active === index ? 'active' : ''}`}>
          <source media="(max-width: 640px)" srcSet={item.mobile} />
          <img src={item.desktop} alt="" />
        </picture>
      ))}
      <div className="hero-overlay">
        <p>{slide.eyebrow}</p>
        <h1>{slide.title}</h1>
        <span>{slide.copy}</span>
        {/* <a href="#best-seller">Khám phá</a> */}
      </div>
      <div className="hero-controls">
        <button aria-label="Slide trước" onClick={() => setActive((active + heroSlides.length - 1) % heroSlides.length)}>
          <HeroIcon name="left" size={18} />
        </button>
        <div>
          {heroSlides.map((item, index) => (
            <button key={item.title} className={active === index ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Chọn slide ${index + 1}`} />
          ))}
        </div>
        <button aria-label="Slide sau" onClick={() => setActive((active + 1) % heroSlides.length)}>
          <HeroIcon name="right" size={18} />
        </button>
      </div>
    </section>
  );
}

window.Hero = Hero;
})();
