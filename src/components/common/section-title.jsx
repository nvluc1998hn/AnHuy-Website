(function () {
function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="section-title reveal">
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

window.SectionTitle = SectionTitle;
})();
