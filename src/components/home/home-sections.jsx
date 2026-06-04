(function () {
const { useEffect: sectionsUseEffect, useState: sectionsUseState } = React;
const homeCdn = window.SiteData?.cdn || '';
const topPicks = Array.isArray(window.SiteData?.topPicks) ? window.SiteData.topPicks : [];
const furnitureImages = Array.isArray(window.SiteData?.furnitureImages) ? window.SiteData.furnitureImages : [];
const topicIcons = ['flower', 'target', 'brush', 'light', 'diamond', 'gift'];

function mapTopPickItem(item) {
  return {
    id: item.id || `${item.collection || item.subtitle}-${item.name || item.label}`,
    label: item.label || item.name || 'Sản phẩm',
    group: item.subtitle || item.collection || '',
    front: item.image_url || item.public_url || item.image,
    back: item.hover_image_url || item.hover_image || item.image_url || item.public_url || item.image,
    href: item.slug ? `#product/${item.slug}` : '#',
  };
}

function TopPicks() {
  const [section, setSection] = sectionsUseState({
    title: 'TOP PICKS',
    description: 'Những sản phẩm được yêu thích nhất tại An Huy',
    items: topPicks,
  });

  sectionsUseEffect(() => {
    let active = true;
    if (!window.FeaturedService?.getFeaturedSection) return () => {};

    window.FeaturedService.getFeaturedSection('top-picks')
      .then((data) => {
        if (!active || !Array.isArray(data?.items) || !data.items.length) return;
        setSection({
          title: data.title || 'TOP PICKS',
          description: data.description || 'Những sản phẩm được yêu thích nhất tại An Huy',
          items: data.items.map(mapTopPickItem),
        });
      })
      .catch((error) => console.warn(error));

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section top-picks">
      <div className="top-picks-head reveal">
        <span className="top-picks-mark">
          <window.Icon name="flower" size={18} />
        </span>
        <h2>{section.title || 'TOP PICKS'}</h2>
        <p>{section.description || 'Những sản phẩm được yêu thích nhất tại An Huy'}</p>
      </div>
      <div className="pick-grid">
        {(Array.isArray(section.items) ? section.items : []).slice(0, 9).map((item, index) => (
          <a className="pick-card reveal" href={item.href || '#'} key={item.id || `${item.group}-${item.label}`} style={{ transitionDelay: `${index * 55}ms` }}>
            <div className={`pick-media ${item.back && item.back !== item.front ? 'has-hover' : ''}`}>
              {item.front ? <img src={item.front} alt={item.label || ''} onError={(event) => event.currentTarget.classList.add('image-fallback')} /> : <span className="product-placeholder">ANHUY</span>}
              {item.back && <img src={item.back} alt="" aria-hidden="true" onError={(event) => event.currentTarget.remove()} />}
            </div>
            <div className="pick-caption">
              <span className="pick-caption-name">
                <i>
                  <window.Icon name={topicIcons[index % topicIcons.length]} size={17} />
                </i>
                <strong>{item.label}</strong>
              </span>
              <window.Icon name="right" size={16} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Furniture() {
  // return (
  //   <section className="section furniture">
  //     <div className="furniture-text reveal">
  //       <h2>NỘI THẤT</h2>
  //       <p>Khám phá định nghĩa mới về sự sang trọng cùng nội thất sơn mài Hanoia</p>
  //       <a href="#">Khám Phá</a>
  //     </div>
  //     <div className="furniture-gallery">
  //       {furnitureImages.map((image, index) => (
  //         <div className={`furniture-frame reveal frame-${index + 1}`} key={image}>
  //           <img src={image} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
  //         </div>
  //       ))}
  //     </div>
  //   </section>
  // );
}

function Story() {
  return (
    <section className="story">
      <div className="story-copy reveal">
        <h2>
          TINH HOA CỦA
          <br />
          THỦ CÔNG VÀ SÁNG TẠO
        </h2>
        <p>
          Gốc rễ của AnHuybắt nguồn từ niềm đam mê với nghề thủ công, đặc biệt là nghệ thuật sơn mài. Từ một xưởng nhỏ chuyên chế tác những tác phẩm sơn mài tinh xảo, AnHuygìn giữ kỹ thuật của cha ông qua những sản phẩm mang hơi thở đương đại.
        </p>
        <p>
          AnHuylà nơi hội tụ của các nghệ sĩ quốc tế danh tiếng và những nghệ nhân tài ba trong nước, cùng kiến tạo nên thiết kế tôn vinh vẻ đẹp thủ công.
        </p>
      </div>
      <div className="story-grid">
        <a className="story-card reveal" href="#">
          <img src={`${homeCdn}_nh_Homepage_1_Copy_.webp`} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
          <span>Thủ công</span>
        </a>
        <a className="story-card reveal" href="#">
          <img src={`${homeCdn}Homepage_2_Copy_.webp`} alt="" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
          <span>Sáng tạo</span>
        </a>
      </div>
    </section>
  );
}

window.TopPicks = TopPicks;
window.Furniture = Furniture;
window.Story = Story;
})();
