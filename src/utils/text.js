
export function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export function titleCase (s) {
  return s.substring(0, 1).toUpperCase() + s.substring(1)
}

export function removeTrailingSlash (str) {
  return str.endsWith('/') ?
      str.slice(0, -1) :
      str;
};