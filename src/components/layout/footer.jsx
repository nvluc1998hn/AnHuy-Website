(function () {
const FooterIcon = window.Icon;

function FloatingContact() {
  return (
    <div className="floating-contact">
      <a href="#" aria-label="Messenger">
        <FooterIcon name="message" size={19} />
      </a>
      <a href="#" aria-label="Zalo">
        Z
      </a>
    </div>
  );
}

function FooterList({ title, items }) {
  return (
    <div className="footer-list">
      <h4>{title}</h4>
      {items.map((item) => (
        <a href="#" key={item}>
          {item}
        </a>
      ))}
    </div>
  );
}

function FooterMap({ address }) {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <aside className="footer-map-card" aria-label="Bản đồ vị trí An Huy">
      <iframe
        src={mapUrl}
        title="Bản đồ An Huy"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a href={openUrl} target="_blank" rel="noreferrer">
        Xem bản đồ
        <FooterIcon name="right" size={13} />
      </a>
    </aside>
  );
}

function Footer() {
  const support = ['Liên hệ', 'Hệ thống cửa hàng', 'Hướng dẫn bảo quản', 'Chính sách đổi hàng', 'Chính sách bảo hành', 'Chính sách giao hàng', 'FAQs'];
  const legal = ['Điều khoản sử dụng', 'Chính sách bảo vệ dữ liệu cá nhân', 'Chính sách Cookie'];
  const companyAddress = 'Lô 10 Làng Nghề Duyên Thái, Thành phố Hà Nội, Việt Nam';

  return (
    <footer className="site-footer">
      <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top
      </button>
      <FooterMap address={companyAddress} />
      <div className="newsletter reveal">
        <h2>Đăng ký bản tin</h2>
        <p>Đăng ký nhận bản tin để nhận thông tin về sản phẩm mới, ưu đãi đặc biệt, các khuyến mãi độc quyền và nhiều hơn nữa.</p>
        <form>
          <input type="email" placeholder="Email" aria-label="Email" />
          <button type="submit">Gửi</button>
        </form>
      </div>

      <div className="footer-grid">
        <div className="footer-company">
          <h3>Công ty TNHH An Huy</h3>
          <p>{companyAddress}</p>
          <p>MST: 0108062837</p>
          <p>Thương hiệu An Huy </p>
        </div>
        <FooterList title="Hỗ trợ khách hàng" items={support} />
        <FooterList title="Chính sách pháp lý" items={legal} />
        <FooterList title="Khách hàng doanh nghiệp" items={['Khách hàng doanh nghiệp']} />
      </div>

      <div className="footer-bottom">
        <div className="socials">
          <a href="#" aria-label="Facebook">
            <FooterIcon name="facebook" size={17} />
          </a>
          <a href="#" aria-label="Instagram">
            <FooterIcon name="instagram" size={17} />
          </a>
          <a href="#" aria-label="Youtube">
            <FooterIcon name="youtube" size={18} />
          </a>
        </div>
        <span>AnHuyOFFICIAL ONLINE STORE</span>
      </div>
    </footer>
  );
}

window.Footer = Footer;
window.FloatingContact = FloatingContact;
})();
