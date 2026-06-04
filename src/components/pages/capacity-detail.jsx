(function () {
const { useEffect: capacityUseEffect, useState: capacityUseState } = React;
const CapacityIcon = window.Icon;

function ImageBlock({ src, alt, className = '', children }) {
  return (
    <figure className={`capacity-image ${className}`}>
      <img src={src} alt={alt || ''} onError={(event) => event.currentTarget.classList.add('image-fallback')} />
      {children}
    </figure>
  );
}

function CapacityDetail() {
  const page = window.SiteData.capacityPage;
  const heroImages = page.galleryImages?.length ? page.galleryImages : [page.image];
  const [activeImage, setActiveImage] = capacityUseState(0);
  const [isPaused, setIsPaused] = capacityUseState(false);

  capacityUseEffect(() => {
    if (heroImages.length <= 1 || isPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [heroImages.length, isPaused]);

  return (
    <section className="capacity-page">
      <div className="capacity-hero reveal is-visible">
        <div className="capacity-hero-copy">
          <CapacityIcon name="flower" size={26} />
          <h1>{page.title}</h1>
          <span />
          <p>{page.description}</p>
        </div>

        <div
          className="capacity-hero-gallery"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {heroImages.map((image, index) => (
            <img
              className={index === activeImage ? 'active' : ''}
              src={image}
              alt={index === activeImage ? page.title : ''}
              key={image}
              onError={(event) => event.currentTarget.classList.add('image-fallback')}
            />
          ))}
          {heroImages.length > 1 && (
            <div className="capacity-gallery-dots" aria-hidden="true">
              {heroImages.map((image, index) => (
                <span className={index === activeImage ? 'active' : ''} key={`${image}-dot`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="capacity-system reveal is-visible">
        <ImageBlock src={page.craftImage || page.image} alt={page.systemTitle} className="capacity-craft-image" />

        <div className="capacity-system-content">
          <div className="capacity-system-head">
            <h2>{page.systemTitle}</h2>
            <p>{page.systemDescription}</p>
          </div>

          <div className="capacity-stat-grid">
            {page.metrics.slice(0, 4).map((metric) => (
              <article className="capacity-stat" key={metric.label}>
                <CapacityIcon name={metric.icon} size={34} />
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="capacity-process reveal is-visible">
        <div className="capacity-section-head">
          <h2>{page.processTitle}</h2>
          <p>{page.processDescription}</p>
        </div>

        <div className="capacity-process-grid">
          {page.processSteps.map((step, index) => (
            <article className="capacity-process-card" key={step.title}>
              <div className="capacity-process-copy">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
              <ImageBlock src={step.image} alt={step.title} />
              {index < page.processSteps.length - 1 && (
                <i className="capacity-process-arrow">
                  <CapacityIcon name="right" size={18} />
                </i>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="capacity-projects reveal is-visible">
        <div className="capacity-project-intro">
          <h2>{page.projectsTitle}</h2>
          <p>{page.projectsDescription}</p>
          <div className="capacity-project-stats">
            {page.projectStats.map((stat) => (
              <span key={stat.label}>
                <strong>{stat.value}</strong>
                {stat.label}
              </span>
            ))}
          </div>
          <a href="#">
            Xem các dự án tiêu biểu
            <CapacityIcon name="right" size={15} />
          </a>
        </div>

        <div className="capacity-project-grid">
          {page.projects.map((project) => (
            <article className="capacity-project-card" key={project.title}>
              <ImageBlock src={project.image} alt={project.title} />
              <div>
                <h3>{project.title}</h3>
                <span>{project.location}</span>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

window.CapacityDetail = CapacityDetail;
})();
