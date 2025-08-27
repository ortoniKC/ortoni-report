import path from "path";

export function normalizeFilePath(filePath: string): string {
  // Normalize the path to handle different separators
  const normalizedPath = path.normalize(filePath);
  // Get the base name of the file (removes any leading directories)
  return path.basename(normalizedPath);
}
export function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString();
  return `${day}-${month}-${year} ${time}`;
}
export function safeStringify(obj: any, indent = 2) {
  const cache = new Set();
  const json = JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    },
    indent
  );
  cache.clear();
  return json;
}
export function ensureHtmlExtension(filename: string) {
  const ext = path.extname(filename);
  if (ext && ext.toLowerCase() === ".html") {
    return filename;
  }
  return `${filename}.html`;
}
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== "string") {
    return String(unsafe);
  }
  return unsafe.replace(/[&<"']/g, function (match: string): string {
    const escapeMap: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escapeMap[match] || match;
  });
}
export function formatDateUTC(date: Date): string {
  return date.toISOString();
}
export function formatDateLocal(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short", // or "Asia/Kolkata"
  };
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatDateNoTimezone(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type SuiteAndTitle = {
  hierarchy: string; // full path joined
  topLevelSuite: string; // first suite
  parentSuite: string; // last suite before title
};

export function extractSuites(titlePath: string[]): SuiteAndTitle {
  const tagPattern = /@[\w]+/g;
  const suiteParts = titlePath
    .slice(3, titlePath.length - 1)
    .map((p) => p.replace(tagPattern, "").trim());
  return {
    hierarchy: suiteParts.join(" > "), // full hierarchy
    topLevelSuite: suiteParts[0] ?? "", // first suite
    parentSuite: suiteParts[suiteParts.length - 1] ?? "", // last suite
  };
}
