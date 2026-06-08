(function () {
const PassionIcon = window.Icon;

const introAsset = (name) => `/src/assets/capacity/${name}`;

const introParagraphs = [
  'Chào mừng quý khách đến với Sơn Mài An Huy.',
  'Được hình thành từ một làng nghề sơn mài truyền thống có lịch sử hơn 200 năm, chúng tôi tự hào kế thừa những giá trị tinh hoa, kỹ thuật thủ công và kinh nghiệm quý báu được truyền lại qua nhiều thế hệ nghệ nhân.',
  'Với hơn 30 năm gắn bó và phát triển cùng nghề sơn mài truyền thống Việt Nam, Sơn Mài An Huy tự hào là đơn vị chuyên sáng tác, sản xuất và cung cấp các sản phẩm sơn mài thủ công mỹ nghệ mang đậm bản sắc văn hóa dân tộc.',
  'Được xây dựng trên nền tảng kinh nghiệm, sự tâm huyết và tình yêu dành cho nghề truyền thống, chúng tôi luôn trân trọng những giá trị được lưu truyền qua nhiều thế hệ nghệ nhân. Mỗi sản phẩm của Sơn Mài An Huy không chỉ là một món đồ trang trí hay quà tặng, mà còn là sự kết tinh của kỹ thuật thủ công tinh xảo, sự sáng tạo và niềm tự hào với văn hóa Việt Nam.',
  'Với phương châm chữ tín quý hơn vàng, chúng tôi đã đem đến cho quý khách những sản phẩm có chất lượng ổn định, thẩm mỹ cao và độ bền vượt thời gian. Chúng tôi cam kết mang đến những sản phẩm chất lượng cao, được hoàn thiện tỉ mỉ trong từng chi tiết, đúng yêu cầu của khách hàng trong nước cũng như bạn bè quốc tế.',
  'Thông qua website này, chúng tôi mong muốn giới thiệu rộng rãi hơn những tác phẩm sơn mài đặc sắc của Việt Nam, đồng thời kết nối với khách hàng, đối tác và những người yêu nghệ thuật thủ công trên khắp thế giới.',
  'Xin chân thành cảm ơn sự quan tâm và tin tưởng của quý khách. Sơn Mài An Huy rất hân hạnh được đồng hành cùng quý khách trong việc khám phá và lan tỏa vẻ đẹp của nghệ thuật sơn mài Việt Nam.',
];

const introImages = {
  hero: introAsset('capacity-vases.png'),
  craft: introAsset('capacity-artisan.png'),
  workshop: introAsset('capacity-factory.png'),
  products: [
    introAsset('capacity-art-panel.png'),
    introAsset('capacity-gift.png'),
    introAsset('capacity-decor.png'),
    introAsset('capacity-custom.png'),
  ],
};

const introValues = [
  {
    icon: 'warehouse',
    title: 'Làng nghề truyền thống',
    body: 'Gốc rễ từ làng nghề sơn mài hơn 200 năm tuổi.',
  },
  {
    icon: 'heart',
    title: 'Hơn 30 năm kinh nghiệm',
    body: 'Gắn bó và phát triển cùng nghệ thuật sơn mài Việt Nam.',
  },
  {
    icon: 'brush',
    title: 'Thủ công tinh xảo',
    body: 'Mỗi sản phẩm là sự kết hợp của kỹ thuật, sáng tạo và tâm huyết.',
  },
  {
    icon: 'diamond',
    title: 'Chất lượng & uy tín',
    body: 'Cam kết chất lượng cao, gìn giữ giá trị truyền thống.',
  },
  {
    icon: 'globe',
    title: 'Kết nối toàn cầu',
    body: 'Mang vẻ đẹp sơn mài Việt Nam đến bạn bè quốc tế.',
  },
];

function IntroImage({ src, alt = '', className = '' }) {
  return (
    <figure className={`intro-image ${className}`}>
      <img src={src} alt={alt} loading="lazy" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
    </figure>
  );
}

function PassionDetail() {
  return (
    <section className="passion-page intro-page">
      <div className="intro-shell reveal is-visible">
        <div className="intro-main">
          <article className="intro-copy">
            <PassionIcon name="flower" size={28} />
            <h1>Lời giới thiệu</h1>
            <span className="intro-title-line" />
            {introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>

          <aside className="intro-media">
            <IntroImage src={introImages.hero} alt="Bình sơn mài An Huy" className="intro-hero-image" />
            <div className="intro-media-row">
              <IntroImage src={introImages.craft} alt="Nghệ nhân chế tác sơn mài" />
              <IntroImage src={introImages.workshop} alt="Xưởng sơn mài An Huy" />
            </div>
          </aside>
        </div>

        <div className="intro-product-strip">
          {introImages.products.map((image, index) => (
            <IntroImage src={image} alt={`Sản phẩm sơn mài ${index + 1}`} key={image} />
          ))}
        </div>

        <div className="intro-values">
          {introValues.map((item) => (
            <article className="intro-value" key={item.title}>
              <PassionIcon name={item.icon} size={34} />
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

window.PassionDetail = PassionDetail;
})();
