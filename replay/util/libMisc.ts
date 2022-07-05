export function getFontAwesomeIconFromMIME(mimeType: string) {
  if (mimeType === undefined) return "fa-file";

  // List of official MIME Types: http://www.iana.org/assignments/media-types/media-types.xhtml
  const icon_classes: Record<string, string> = {
    "application/pdf": "fa-file-pdf",
    "application/msword": "fa-file-word",
    "application/vnd.ms-word": "fa-file-word",
    "application/vnd.oasis.opendocument.text": "fa-file-word",
    "application/vnd.openxmlformatsfficedocument.wordprocessingml":
      "fa-file-word",
    "application/vnd.ms-excel": "fa-file-excel",
    "application/vnd.openxmlformatsfficedocument.spreadsheetml":
      "fa-file-excel",
    "application/vnd.oasis.opendocument.spreadsheet": "fa-file-excel",
    "application/vnd.ms-powerpoint": "fa-file-powerpoint",
    "application/vnd.openxmlformatsfficedocument.presentationml":
      "fa-file-powerpoint",
    "application/vnd.oasis.opendocument.presentation": "fa-file-powerpoint",
    "text/plain": "fa-file-text",
    "text/html": "fa-file-code",
    "application/json": "fa-file-code",
    // Archives
    "application/gzip": "fa-file-archive",
    "application/zip": "fa-file-archive",
  };

  if (mimeType.startsWith("image/")) return "fa-file-image";
  if (mimeType.startsWith("video/")) return "fa-file-video";
  if (mimeType.startsWith("audio/")) return "fa-file-audio";

  const icon = icon_classes[mimeType];
  if (icon) return icon;
  return "fa-file";
}

export function bytesToSize(bytes: number) {
  var sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 B";
  var i = ~~Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
}

export function msToTime(s: number): string {
  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z: number = 2) {
    return ("00" + n).slice(-z);
  }

  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;

  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + "." + pad(ms, 3);
}

export function msToFormatTime(s: number): string {
  // Pad to 2 or 3 digits, default is 2
  function pad2(n: number, z: number = 2, format: string) {
    if (n === 0) return "";
    return (n | 0) + format;
  }

  let ms = s % 1000;
  s = (s - ms) / 1000;
  let secs = s % 60;
  s = (s - secs) / 60;
  let mins = s % 60;
  let hrs = (s - mins) / 60;

  return (
    pad2(hrs, 2, "h") +
    pad2(mins, 2, "m") +
    pad2(secs, 2, "s") +
    pad2(ms, 3, "ms")
  );
}
