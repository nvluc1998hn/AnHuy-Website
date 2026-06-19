(function () {
const FooterIcon = window.Icon;
const { useState: footerUseState, useEffect: footerUseEffect } = React;

// Các kênh liên hệ: hiển thị trong bảng khi mở, và luân phiên (chạy) trên nút khi đóng.
const CONTACT_CHANNELS = [
  { key: 'phone', label: 'Gọi miễn phí', href: 'tel:0889977118' },
  { key: 'zalo', label: 'Zalo Chat', href: '#' },
  { key: 'facebook', label: 'Facebook', href: '#' },
];

function ChannelGlyph({ channel, size = 22 }) {
  if (channel === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.69l.4-3.12h-3.09V7.9c0-.9.25-1.52 1.54-1.52h1.65V3.59c-.29-.04-1.27-.12-2.42-.12-2.39 0-4.03 1.46-4.03 4.14v2.31H7.5V13h2.74v8h3.26Z" />
      </svg>
    );
  }
  if (channel === 'zalo') {
    return <span className="fc-zalo-text">Zalo</span>;
  }
  return <FooterIcon name="phone" size={size} />;
}

function FloatingContact() {
  const [open, setOpen] = footerUseState(false);
  const [cycle, setCycle] = footerUseState(0);

  // Khi đóng: luân phiên icon các kênh để thu hút chú ý. Mở thì dừng.
  footerUseEffect(() => {
    if (open) return undefined;
    const id = window.setInterval(
      () => setCycle((current) => (current + 1) % CONTACT_CHANNELS.length),
      2000,
    );
    return () => window.clearInterval(id);
  }, [open]);

  const activeChannel = CONTACT_CHANNELS[cycle];

  return (
    <div className={`floating-contact ${open ? 'open' : ''}`}>
      <div className="fc-panel" role="menu" aria-hidden={!open}>
        {CONTACT_CHANNELS.map((channel) => (
          <a
            className="fc-panel-item"
            key={channel.key}
            href={channel.href}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            target={channel.href.startsWith('tel:') ? undefined : '_blank'}
            rel={channel.href.startsWith('tel:') ? undefined : 'noreferrer'}
          >
            <span className="fc-panel-icon">
              <ChannelGlyph channel={channel.key} size={20} />
            </span>
            <span className="fc-panel-label">{channel.label}</span>
          </a>
        ))}
      </div>

      <button
        type="button"
        className="fc-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Đóng liên hệ' : 'Liên hệ'}
      >
        {open ? (
          <FooterIcon name="x" size={20} />
        ) : (
          <span className="fc-toggle-inner">
            <span className="fc-toggle-glyph" key={activeChannel.key}>
              <ChannelGlyph channel={activeChannel.key} size={18} />
            </span>
            <span className="fc-toggle-label">Liên hệ</span>
          </span>
        )}
      </button>
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

function FooterMap({ address, mapQuery, placeUrl }) {
  const query = mapQuery || address;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
  const openUrl = placeUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

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
  const companyAddress = 'Sơn mài An Huy, Duyên Thái, Thường Tín, Hà Nội, Việt Nam';
  const companyMapQuery = '20.9024287,105.8648024';
  const companyMapUrl = 'https://www.google.com/maps/place/S%C6%A1n+m%C3%A0i+An+Huy/@20.9024287,105.8648024,1053m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3135b35c21449d39:0xb3d34e9a841a4130!8m2!3d20.9024287!4d105.8648024!16s%2Fg%2F11pld76746!18m1!1e1?entry=ttu';

  return (
    <footer className="site-footer">
      <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to top
      </button>
      <FooterMap address={companyAddress} mapQuery={companyMapQuery} placeUrl={companyMapUrl} />
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
