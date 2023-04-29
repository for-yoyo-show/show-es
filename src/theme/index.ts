const hash = __webpack_hash__;

const ThemeId = 'theme';

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
    link.onload = () => {
      console.log(`${theme}.css loaded.`);
    };
    link.onerror = () => {
      console.error(`Failed to load ${theme}.css.`);
    };
    document.head.appendChild(link);
  }
}

export default loadStyle;
