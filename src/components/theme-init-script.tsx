// Stamp data-theme/data-palette sur <html> avant le premier paint, pour
// éviter un flash du mauvais thème. Mode clair par défaut (indépendant du
// thème système), palette "classic" par défaut.
const THEME_INIT = `
(function () {
  try {
    var theme = localStorage.getItem('arira-admin-theme') || 'light';
    var palette = localStorage.getItem('arira-admin-palette');
    document.documentElement.setAttribute('data-theme', theme);
    if (palette && palette !== 'classic') {
      document.documentElement.setAttribute('data-palette', palette);
    }
  } catch (e) {}
})();
`;

export function ThemeInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
