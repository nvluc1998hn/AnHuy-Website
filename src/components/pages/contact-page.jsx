(function () {
const ContactIcon = window.Icon;
const { useState: contactUseState } = React;

// Thông tin liên hệ. Địa chỉ/MST lấy theo footer; điện thoại & email là placeholder,
// chỉnh lại tại đây khi có thông tin chính thức.
const COMPANY = {
  name: 'Công ty TNHH An Huy',
  address: 'Sơn mài An Huy, Duyên Thái, Thường Tín, Hà Nội, Việt Nam',
  taxCode: '0108062837',
  phone: '+84 24 3858 0000',
  email: 'info@anhuy.com.vn',
  hours: 'Thứ 2 – Thứ 7: 08:00 – 17:30',
  mapQuery: '20.9024287,105.8648024',
};

const SUBJECTS = [
  'Tư vấn sản phẩm',
  'Đặt hàng theo yêu cầu (OEM/ODM)',
  'Hợp tác doanh nghiệp',
  'Khiếu nại / Bảo hành',
  'Khác',
];

const EMPTY_FORM = { name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' };

function ContactInfoRow({ icon, label, children }) {
  return (
    <li className="contact-info-row">
      <span className="contact-info-icon">
        <ContactIcon name={icon} size={20} />
      </span>
      <span className="contact-info-text">
        <small>{label}</small>
        <strong>{children}</strong>
      </span>
    </li>
  );
}

function ContactPage() {
  const [form, setForm] = contactUseState(EMPTY_FORM);
  const [errors, setErrors] = contactUseState({});
  const [submitted, setSubmitted] = contactUseState(false);

  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(COMPANY.mapQuery)}&z=16&output=embed`;

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên.';
    if (!form.email.trim()) {
      nextErrors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Email không hợp lệ.';
    }
    if (form.phone.trim() && !/^[0-9+()\s.-]{6,}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Số điện thoại không hợp lệ.';
    }
    if (!form.message.trim()) nextErrors.message = 'Vui lòng nhập nội dung.';
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    // Chưa có backend tiếp nhận — lưu tạm vào console và hiển thị xác nhận.
    console.info('Liên hệ mới:', form);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section className="contact-page">
      <div className="contact-shell">
        <header className="contact-hero reveal is-visible">
          <ContactIcon name="mail" size={28} />
          <h1>Liên hệ với An Huy</h1>
          <span className="contact-title-line" />
          <p>
            Bạn cần tư vấn sản phẩm, đặt hàng theo yêu cầu hay hợp tác doanh nghiệp?
            Hãy để lại thông tin, đội ngũ An Huy sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </header>

        <div className="contact-grid">
          <aside className="contact-info reveal is-visible">
            <h2>Thông tin liên hệ</h2>
            <ul className="contact-info-list">
              <ContactInfoRow icon="pin" label="Địa chỉ">{COMPANY.address}</ContactInfoRow>
              <ContactInfoRow icon="phone" label="Điện thoại">
                <a href={`tel:${COMPANY.phone.replace(/\s/g, '')}`}>{COMPANY.phone}</a>
              </ContactInfoRow>
              <ContactInfoRow icon="mail" label="Email">
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </ContactInfoRow>
              <ContactInfoRow icon="clock" label="Giờ làm việc">{COMPANY.hours}</ContactInfoRow>
              <ContactInfoRow icon="clipboard" label="Mã số thuế">{COMPANY.taxCode}</ContactInfoRow>
            </ul>

            <div className="contact-map">
              <iframe
                src={mapUrl}
                title="Bản đồ An Huy"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </aside>

          <div className="contact-form-card reveal is-visible">
            {submitted ? (
              <div className="contact-success">
                <span className="contact-success-icon">
                  <ContactIcon name="heart" size={34} />
                </span>
                <h2>Cảm ơn bạn đã liên hệ!</h2>
                <p>
                  Thông tin của <strong>{form.name}</strong> đã được ghi nhận. Đội ngũ An Huy sẽ
                  phản hồi qua email <strong>{form.email}</strong> trong thời gian sớm nhất.
                </p>
                <button type="button" className="contact-submit" onClick={resetForm}>
                  Gửi liên hệ khác
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2>Gửi thông tin cho chúng tôi</h2>

                <label className={`contact-field ${errors.name ? 'has-error' : ''}`}>
                  <span>Họ và tên *</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField('name')}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                  />
                  {errors.name && <small className="contact-error">{errors.name}</small>}
                </label>

                <div className="contact-field-row">
                  <label className={`contact-field ${errors.email ? 'has-error' : ''}`}>
                    <span>Email *</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      placeholder="email@cua-ban.com"
                      autoComplete="email"
                    />
                    {errors.email && <small className="contact-error">{errors.email}</small>}
                  </label>

                  <label className={`contact-field ${errors.phone ? 'has-error' : ''}`}>
                    <span>Số điện thoại</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={updateField('phone')}
                      placeholder="09xx xxx xxx"
                      autoComplete="tel"
                    />
                    {errors.phone && <small className="contact-error">{errors.phone}</small>}
                  </label>
                </div>

                <label className="contact-field">
                  <span>Chủ đề</span>
                  <select value={form.subject} onChange={updateField('subject')}>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={`contact-field ${errors.message ? 'has-error' : ''}`}>
                  <span>Nội dung *</span>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={updateField('message')}
                    placeholder="Nhập nội dung bạn muốn trao đổi..."
                  />
                  {errors.message && <small className="contact-error">{errors.message}</small>}
                </label>

                <button type="submit" className="contact-submit">
                  Gửi liên hệ
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

window.ContactPage = ContactPage;
})();
