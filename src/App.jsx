(function () {
const { useEffect } = React;
const { useScrollReveal, useHashRoute } = window.AppHooks;

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

  return (
    <main>
      <AppErrorBoundary key={route}>
        <window.Header />
        {route === '#passion' ? (
          <window.PassionDetail />
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
            <window.Story />
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
