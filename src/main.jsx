const root = document.getElementById('root');

if (window.App) {
  ReactDOM.createRoot(root).render(<window.App />);
} else {
  root.innerHTML = '<main><section class="section app-error"><h2>Trang đang tải lại dữ liệu</h2><p>Vui lòng làm mới trang hoặc quay lại sau ít giây.</p></section></main>';
}
