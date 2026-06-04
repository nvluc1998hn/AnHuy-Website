(function () {
const { useEffect, useState } = React;

function useScrollReveal() {
  useEffect(() => {
    const observedNodes = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.14 },
    );

    const observeRevealNode = (node) => {
      if (!(node instanceof Element) || observedNodes.has(node)) return;
      observedNodes.add(node);
      observer.observe(node);
    };

    const observeRevealTree = (root) => {
      if (!(root instanceof Element)) return;
      if (root.matches('.reveal')) observeRevealNode(root);
      root.querySelectorAll('.reveal').forEach(observeRevealNode);
    };

    observeRevealTree(document.body);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(observeRevealTree);
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);
}

function useHashRoute() {
  const [route, setRoute] = useState(window.location.hash || '#');

  useEffect(() => {
    const updateRoute = () => setRoute(window.location.hash || '#');
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  return route;
}

window.AppHooks = { useScrollReveal, useHashRoute };
})();
