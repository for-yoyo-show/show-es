const hash = __webpack_hash__;
const ThemeId = 'theme';

/**
 * @param theme 'dark' | 'light'
 */
function loadStyle(theme) {
  let link = document.getElementById(ThemeId) as HTMLLinkElement;
  if (link) {
    link.setAttribute('href', `${theme}.${hash}.css`);
  } else {
    link = document.createElement('link');
    link.id = ThemeId;
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', `${theme}.${hash}.css`);
    document.head.appendChild(link);
  }
}

export default loadStyle;
