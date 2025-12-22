export const $ = (root, view, s = {}) => {
  const el = document.querySelector(root);

  const bind = () => {
    el.querySelectorAll("[data-click],[data-input],[data-change]").forEach(
      (n) => {
        const d = n.dataset;
        d.click &&
          s[d.click] &&
          n.addEventListener("click", (e) => s[d.click].call(s, e));
        d.input &&
          s[d.input] &&
          n.addEventListener("input", (e) => s[d.input].call(s, e));
        d.change &&
          s[d.change] &&
          n.addEventListener("change", (e) => s[d.change].call(s, e));
      }
    );
  };

  s.render = () => {
    el.innerHTML = view(s);
    bind();
  };

  s.render();
  return s;
};
