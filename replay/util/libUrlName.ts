function isAboutBlank(url: URL): boolean {
  return url.toString() === "about:blank";
}

function isDataURL(url: URL): boolean {
  return url.protocol === "data";
}

function isHttpOrHttps(url: URL): boolean {
  return url.protocol === "http" || url.protocol === "https";
}

function isBlobURL(url: URL): boolean {
  return url.toString().startsWith("blob:");
}

function dataURLDisplayName(url: URL): string {
  return url.toString().slice(0, 20) + "...";
}

export const getUrlName = (url: string) => {
  const uri = new URL(url);

  if (isDataURL(uri)) return dataURLDisplayName(uri);
  if (isBlobURL(uri)) return url;
  if (isAboutBlank(uri)) return url;

  if (uri.pathname === "/") return uri.host;

  const paths = uri.pathname.split("/");
  const lastPath = "/" + paths.slice(-1);
  if (uri.search) return lastPath + uri.search;
  return lastPath;
};
