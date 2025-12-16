export const platform = (() => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf("win") > 0) {
    return "windows";
  } else if (ua.indexOf("mac") > 0) {
    return "macos";
  } else if (ua.indexOf("linux") > 0) {
    return "linux";
  } else {
    return "unknown";
  }
})();
