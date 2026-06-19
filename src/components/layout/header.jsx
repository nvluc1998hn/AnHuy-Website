(function () {
const { useEffect: headerUseEffect, useState: headerUseState } = React;
const Icon = window.Icon;

function getItemHref(item) {
  if (typeof item === 'string') return '#';
  return item.href || '#';
}

function getItemLabel(item) {
  return typeof item === 'string' ? item : item.label;
}

// Nhóm header "Liên hệ" được fix cứng trỏ tới màn hình #contact thay vì mở mega-menu.
// Các nhóm khác vẫn load mega-menu theo chuẩn chung ban đầu.
const CONTACT_ROUTE = '#contact';
function isContactGroup(group) {
  const title = (group?.title || '').trim().toLowerCase();
  const slug = (group?.slug || '').trim().toLowerCase();
  return (
    title === 'liên hệ' ||
    title === 'lien he' ||
    slug === 'lien-he' ||
    slug === 'contact'
  );
}

// Nhóm header "Trang chủ" được fix cứng đưa về trang chủ và cuộn lên đầu trang,
// kể cả khi đang ở trang chủ. Các nhóm khác vẫn mở mega-menu theo chuẩn chung.
const HOME_ROUTE = '#';
function isHomeGroup(group) {
  const title = (group?.title || '').trim().toLowerCase();
  const slug = (group?.slug || '').trim().toLowerCase();
  return (
    title === 'trang chủ' ||
    title === 'trang chu' ||
    slug === 'trang-chu' ||
    slug === 'home'
  );
}

function MenuContent({ group, compact = false }) {
  const menuItems = (group.items || []).filter((item) => !(typeof item !== 'string' && item.isHeading));

  return (
    <ul className={compact ? 'menu-list compact' : 'menu-list'}>
      {menuItems.map((item, index) => {
        const count = typeof item === 'string' ? null : item.productCount;
        return (
          <li key={`${getItemLabel(item)}-${index}`}>
            <a href={getItemHref(item)}>
              <span>{getItemLabel(item)}</span>
              {count !== null && count !== undefined && <small>{count} sản phẩm</small>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function MegaMenu({ group }) {
  const menuRows = (group.items || []).filter((item) => !(typeof item !== 'string' && item.isHeading));
  const splitIndex = Math.ceil(menuRows.length / 2);
  const columns = [menuRows.slice(0, splitIndex), menuRows.slice(splitIndex)];

  return (
    <div className="mega-menu category-mega-menu">
      <div className="mega-category-shell">
        <div className="mega-category-intro">
          <div className="mega-breadcrumb">
            <span>Trang chủ</span>
            <Icon name="right" size={11} />
            <span>{group.title}</span>
          </div>
          <h3>{group.title}</h3>
          <span className="mega-title-mark" />
          <p>Tinh tế trong từng chi tiết, sản phẩm An Huy là sự kết hợp giữa công năng và nghệ thuật.</p>
        </div>

        <div className="mega-category-grid">
          {columns.map((column, columnIndex) => (
            <div className="mega-category-column" key={columnIndex}>
              {column.map((item, index) => {
                const label = getItemLabel(item);
                const href = getItemHref(item);
                const image = typeof item === 'string' ? group.image : item.image || group.image;
                const count = typeof item === 'string' ? null : item.productCount;

                return (
                  <a className="mega-category-row" href={href} key={`${label}-${index}`}>
                    <span className={`mega-category-image ${image ? '' : 'empty'}`}>
                      {image ? (
                        <img
                          src={image}
                          alt={label}
                          loading="lazy"
                          onError={(event) => event.currentTarget.closest('.mega-category-image').classList.add('empty')}
                        />
                      ) : (
                        'AN'
                      )}
                    </span>
                    <span className="mega-category-text">
                      <strong>{label}</strong>
                      {count !== null && count !== undefined && <small>{count} sản phẩm</small>}
                    </span>
                    <Icon name="right" size={16} />
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = headerUseState(false);
  const [mega, setMega] = headerUseState(null);
  const [closeTimer, setCloseTimer] = headerUseState(null);
  const [navGroups, setNavGroups] = headerUseState([]);

  const cancelMegaClose = () => {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      setCloseTimer(null);
    }
  };

  // Về trang chủ và cuộn lên đầu trang. preventDefault để không bị hành vi mặc
  // định của href="#" xung đột với scrollTo; cuộn thủ công để hoạt động cả khi
  // đang ở trang chủ (lúc đó hash không đổi nên App không tự cuộn).
  const goHome = (event) => {
    if (event) event.preventDefault();
    setMega(null);
    setOpen(false);
    if (window.location.hash && window.location.hash !== HOME_ROUTE) {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scheduleMegaClose = () => {
    cancelMegaClose();
    const timer = window.setTimeout(() => setMega(null), 180);
    setCloseTimer(timer);
  };

  headerUseEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  headerUseEffect(() => () => closeTimer && window.clearTimeout(closeTimer), [closeTimer]);

  headerUseEffect(() => {
    let active = true;
    if (!window.NavigationService?.getNavigationGroups) return () => {};

    window.NavigationService.getNavigationGroups()
      .then((groups) => {
        if (active) setNavGroups(Array.isArray(groups) ? groups : []);
      })
      .catch((error) => {
        console.warn(error);
        if (active) setNavGroups([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="topbar">
        <a href="#">BST ADV FW26</a>
        <a href="#">TINH HOA SƠN MÀI VIỆT • VẺ ĐẸP VƯỢT THỜI GIAN</a>
      </div>

      <header className="site-header" onMouseEnter={cancelMegaClose} onMouseLeave={scheduleMegaClose}>
        <button className="icon-button lg:hidden" onClick={() => setOpen(true)} aria-label="Mở menu">
          <Icon name="menu" size={21} />
        </button>

        <nav className="hidden lg:flex nav-primary">
          {navGroups.slice(0, 7).map((group) =>
            isHomeGroup(group) ? (
              <a
                key={group.id || group.title}
                href={HOME_ROUTE}
                className="nav-link"
                onMouseEnter={scheduleMegaClose}
                onClick={goHome}
              >
                {group.title}
              </a>
            ) : isContactGroup(group) ? (
              <a
                key={group.id || group.title}
                href={CONTACT_ROUTE}
                className="nav-link"
                onMouseEnter={scheduleMegaClose}
              >
                {group.title}
              </a>
            ) : (
              <button
                key={group.id || group.title}
                onMouseEnter={() => {
                  cancelMegaClose();
                  setMega(group);
                }}
                className="nav-link"
              >
                {group.title}
              </button>
            ),
          )}
        </nav>

        <a href="#" className="brand" aria-label="AnHuy home">
          <img src="/src/assets/Lo_go_an_huy.png?v=transparent" alt="An Huy" />
        </a>

        <div className="header-actions">
          <button className="icon-button hidden sm:grid" aria-label="Tìm kiếm">
            <Icon name="search" size={19} />
          </button>
          <a className="login hidden md:inline" href="#admin/products">
            Đăng nhập
          </a>
          <span className="language hidden sm:inline">VN&nbsp;&nbsp;EN</span>
          <button className="cart-button" aria-label="Giỏ hàng">
            <Icon name="bag" size={19} />
            <span>( 0 )</span>
          </button>
        </div>

        {mega !== null && (
          <div onMouseEnter={cancelMegaClose} onMouseLeave={scheduleMegaClose}>
            <MegaMenu group={mega} />
          </div>
        )}
      </header>

      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-head">
          <button className="icon-button" onClick={() => setOpen(false)} aria-label="Đóng menu">
            <Icon name="x" size={21} />
          </button>
          <span>Đóng</span>
        </div>
        <div className="drawer-list" onClick={(event) => event.target.closest('a') && setOpen(false)}>
          {navGroups.map((group) =>
            isHomeGroup(group) ? (
              <a className="drawer-link" key={group.id || group.title} href={HOME_ROUTE} onClick={goHome}>
                {group.title}
                <Icon name="right" size={16} />
              </a>
            ) : isContactGroup(group) ? (
              <a className="drawer-link" key={group.id || group.title} href={CONTACT_ROUTE}>
                {group.title}
                <Icon name="right" size={16} />
              </a>
            ) : (
              <details key={group.id || group.title}>
                <summary>
                  {group.title}
                  <Icon name="right" size={16} />
                </summary>
                <MenuContent group={group} compact />
              </details>
            ),
          )}
        </div>
        <div className="drawer-bottom">
          <a href="#admin/products">Đăng nhập</a>
          <span>Ngôn ngữ</span>
          <strong>VN&nbsp;&nbsp;EN</strong>
        </div>
      </aside>
      <button className={`scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-label="Đóng menu" />
    </>
  );
}

window.Header = Header;
})();
