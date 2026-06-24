(function () {
const { useEffect } = React;
const { useScrollReveal, useHashRoute } = window.AppHooks;

const BASE_TITLE = 'An Huy – Gốm sứ & đồ trang trí thủ công mỹ nghệ';

// Title cho các route có nội dung tĩnh. Route #product/ và #category/ tự đặt
// title riêng (theo tên sản phẩm/danh mục) khi tải xong dữ liệu.
const ROUTE_TITLES = {
  '#': BASE_TITLE,
  '': BASE_TITLE,
  '#passion': 'Niềm đam mê | An Huy',
  '#contact': 'Liên hệ | An Huy',
  '#capacity': 'Năng lực sản xuất | An Huy',
  '#admin/products': 'Quản lý sản phẩm | An Huy',
  '#admin/categories': 'Quản lý danh mục | An Huy',
  '#admin/featured': 'Quản lý Featured | An Huy',
  '#admin/partners': 'Quản lý đối tác | An Huy',
  '#admin/navigation-groups': 'Quản lý nhóm menu | An Huy',
  '#admin/navigation-items': 'Quản lý menu item | An Huy',
};

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="section app-error">
          <h2>Trang đang tải lại dữ liệu</h2>
          <p>Vui lòng làm mới trang hoặc quay lại sau ít giây.</p>
        </section>
      );
    }

    return this.props.children;
  }
}

function App() {
  useScrollReveal();
  const route = useHashRoute();
  const isAdminRoute = route.startsWith('#admin/');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  useEffect(() => {
    if (route.startsWith('#product/') || route.startsWith('#category/')) return;
    document.title = ROUTE_TITLES[route] || BASE_TITLE;
  }, [route]);

  return (
    <main>
      <AppErrorBoundary key={route}>
        <window.Header />
        {route === '#passion' ? (
          <window.PassionDetail />
        ) : route === '#contact' ? (
          <window.ContactPage />
        ) : route === '#capacity' ? (
          <window.CapacityDetail />
        ) : route.startsWith('#category/') ? (
          <window.CategoryListing route={route} />
        ) : route.startsWith('#product/') ? (
          <window.ProductDetail route={route} />
        ) : route === '#admin/products' ? (
          <window.ProductAdmin />
        ) : route === '#admin/categories' ? (
          <window.CategoriesAdmin />
        ) : route === '#admin/featured' ? (
          <window.FeaturedAdmin />
        ) : route === '#admin/partners' ? (
          <window.PartnersAdmin />
        ) : route === '#admin/navigation-groups' ? (
          <window.NavigationGroupsAdmin initialPanel="groups" />
        ) : route === '#admin/navigation-items' ? (
          <window.NavigationGroupsAdmin initialPanel="items" />
        ) : (
          <>
            <window.Hero />
            <window.BestSeller />
            <window.TopPicks />
            {window.Furniture && <window.Furniture />}
            <window.CustomerGallery />
            <window.PartnersSection />
          </>
        )}
        {!isAdminRoute && <window.Footer />}
        {!isAdminRoute && <window.FloatingContact />}
      </AppErrorBoundary>
    </main>
  );
}

window.App = App;
})();
