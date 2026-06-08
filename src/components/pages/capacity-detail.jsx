(function () {
const CapacityIcon = window.Icon;

const capacityAsset = (name) => `/src/assets/capacity/${name}`;

const capabilityCards = [
  {
    icon: 'users',
    title: 'Nghệ nhân lành nghề',
    description: 'Đội ngũ nghệ nhân nhiều năm kinh nghiệm, am hiểu kỹ thuật sơn mài truyền thống và không ngừng sáng tạo.',
    image: capacityAsset('capacity-artisan.png'),
  },
  {
    icon: 'warehouse',
    title: 'Năng lực sản xuất',
    description: 'Xưởng sản xuất quy mô lớn, trang bị hiện đại, quy trình kiểm soát chất lượng chặt chẽ, đảm bảo tiến độ.',
    image: capacityAsset('capacity-factory.png'),
  },
  {
    icon: 'globe',
    title: 'Đạt chuẩn quốc tế',
    description: 'Sản phẩm được xuất khẩu và phân phối tới nhiều thị trường có yêu cầu cao về chất lượng và tính thẩm mỹ.',
    image: capacityAsset('capacity-vases.png'),
  },
  {
    icon: 'handshake',
    title: 'Uy tín toàn cầu',
    description: 'Được đối tác và khách hàng quốc tế tin tưởng lựa chọn, đồng hành lâu dài.',
    image: capacityAsset('capacity-partnership.png'),
  },
];

const markets = [
  { flag: '🇺🇸', label: 'Hoa Kỳ' },
  { flag: '🇦🇺', label: 'Úc' },
  { flag: '🇯🇵', label: 'Nhật Bản' },
  { flag: '🇫🇷', label: 'Pháp' },
  { flag: '🇪🇸', label: 'Tây Ban Nha' },
  { flag: '···', label: '...' },
];

const capacityRanges = [
  { title: 'Tranh sơn mài nghệ thuật', image: capacityAsset('capacity-art-panel.png') },
  { title: 'Sản phẩm trang trí nội thất', image: capacityAsset('capacity-interior.png') },
  { title: 'Quà tặng doanh nghiệp', image: capacityAsset('capacity-gift.png') },
  { title: 'Thủ công mỹ nghệ cao cấp', image: capacityAsset('capacity-decor.png') },
  { title: 'Sản xuất theo yêu cầu (OEM/ODM)', image: capacityAsset('capacity-custom.png') },
];

const commitments = [
  {
    icon: 'target',
    title: 'Chất lượng ổn định',
    description: 'Kiểm soát chặt chẽ từ nguyên liệu đến thành phẩm.',
  },
  {
    icon: 'light',
    title: 'Không ngừng sáng tạo',
    description: 'Kết hợp tinh hoa truyền thống với tư duy thiết kế hiện đại.',
  },
  {
    icon: 'shield',
    title: 'Đáp ứng tiêu chuẩn quốc tế',
    description: 'Đảm bảo chất lượng, an toàn và thân thiện với môi trường.',
  },
  {
    icon: 'users',
    title: 'Hợp tác bền vững',
    description: 'Đồng hành cùng đối tác và khách hàng trên con đường phát triển lâu dài.',
  },
  {
    icon: 'globe',
    title: 'Vươn tầm quốc tế',
    description: 'Mang giá trị tinh hoa sơn mài Việt Nam đến khắp thế giới.',
  },
  {
    icon: 'heart',
    title: 'Tận tâm với khách hàng',
    description: 'Lắng nghe, thấu hiểu và đem đến giải pháp phù hợp nhất.',
  },
];

function CapacityImage({ src, alt, className = '' }) {
  return (
    <figure className={`capacity-image ${className}`}>
      <img src={src} alt={alt || ''} loading="lazy" onError={(event) => event.currentTarget.classList.add('image-fallback')} />
    </figure>
  );
}

function CapacityDetail() {
  return (
    <section className="capacity-page">
      <div className="capacity-shell">
        <section className="capacity-hero reveal is-visible">
          <div className="capacity-hero-copy">
            <CapacityIcon name="flower" size={28} />
            <h1>Năng lực sơn mài An Huy</h1>
            <span className="capacity-title-line" />
            <p>
              Với hơn 30 năm kinh nghiệm trong lĩnh vực sơn mài thủ công mỹ nghệ,
              Sơn Mài An Huy đã xây dựng được uy tín vững chắc trên thị trường
              trong nước và quốc tế.
            </p>
            <p>
              Chúng tôi sở hữu đội ngũ nghệ nhân lành nghề, am hiểu sâu sắc các kỹ thuật
              sơn mài truyền thống kết hợp với tư duy thiết kế hiện đại, đáp ứng đa dạng
              nhu cầu của khách hàng trên toàn thế giới.
            </p>
          </div>

          <CapacityImage src={capacityAsset('capacity-hero.png')} alt="Nghệ nhân An Huy chế tác sơn mài" className="capacity-hero-image" />
        </section>

        <section className="capacity-card-grid reveal is-visible">
          {capabilityCards.map((card) => (
            <article className="capacity-card" key={card.title}>
              <div className="capacity-card-copy">
                <span className="capacity-card-icon">
                  <CapacityIcon name={card.icon} size={34} />
                </span>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
              <CapacityImage src={card.image} alt={card.title} />
            </article>
          ))}
        </section>

        <section className="capacity-market reveal is-visible">
          <div className="capacity-market-copy">
            <h2>Hiện diện trên thị trường quốc tế</h2>
            <p>
              Sản phẩm của Sơn Mài An Huy đã có mặt tại nhiều quốc gia và vùng lãnh thổ,
              khẳng định thương hiệu sơn mài Việt Nam trên bản đồ thế giới.
            </p>
          </div>
          <CapacityImage src={capacityAsset('capacity-world-map.png')} alt="Bản đồ thị trường quốc tế" className="capacity-map-image" />
          <ul className="capacity-market-list">
            {markets.map((market) => (
              <li key={market.label}>
                <span>{market.flag}</span>
                <strong>{market.label}</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="capacity-range reveal is-visible">
          <div className="capacity-range-copy">
            <h2>Đa dạng năng lực đáp ứng</h2>
            <p>
              Chúng tôi có khả năng thực hiện các đơn hàng từ quy mô nhỏ đến lớn,
              nhận sản xuất theo thiết kế riêng (OEM/ODM), đáp ứng đa dạng nhu cầu
              của khách hàng.
            </p>
          </div>

          <div className="capacity-range-list">
            {capacityRanges.map((item) => (
              <article className="capacity-range-item" key={item.title}>
                <CapacityImage src={item.image} alt={item.title} />
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="capacity-commitment reveal is-visible">
          <div className="capacity-commitment-head">
            <h2>Chất lượng tạo nên uy tín - Uy tín tạo dựng niềm tin</h2>
            <span className="capacity-title-line" />
          </div>

          <div className="capacity-commitment-grid">
            {commitments.map((item) => (
              <article className="capacity-commitment-item" key={item.title}>
                <CapacityIcon name={item.icon} size={38} />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="capacity-final-strip">
        Sơn Mài An Huy - Tinh hoa sơn mài Việt Nam
        <CapacityIcon name="flower" size={15} />
      </div>
    </section>
  );
}

window.CapacityDetail = CapacityDetail;
})();
