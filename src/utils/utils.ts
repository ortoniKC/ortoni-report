import path from 'path';

export function msToTime(duration: number): string {
    const milliseconds = Math.floor(duration % 1000);
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    let result = '';

    if (hours > 0) {
        result += `${hours}h:`;
    }
    if (minutes > 0 || hours > 0) {
        result += `${minutes < 10 ? '0' + minutes : minutes}m:`;
    }
    if (seconds > 0 || minutes > 0 || hours > 0) {
        result += `${seconds < 10 ? '0' + seconds : seconds}s`;
    }
    if (milliseconds > 0 && !(seconds > 0 || minutes > 0 || hours > 0)) {
        result += `${milliseconds}ms`;
    } else if (milliseconds > 0) {
        result += `:${milliseconds < 100 ? '0' + milliseconds : milliseconds}ms`;
    }

    return result;
}
export function normalizeFilePath(filePath: string): string {
    // Normalize the path to handle different separators
    const normalizedPath = path.normalize(filePath);
    // Get the base name of the file (removes any leading directories)
    return path.basename(normalizedPath);
}
export function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString();
    return `${day}-${month}-${year} ${time}`;
}
export function safeStringify(obj: any, indent = 2) {
    const cache = new Set();
    const json = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return;
            }
            cache.add(value);
        }
        return value;
    }, indent);
    cache.clear();
    return json;
}
export function ensureHtmlExtension(filename: string) {
    const ext = path.extname(filename);
    if (ext && ext.toLowerCase() === '.html') {
        return filename;
    }
    return `${filename}.html`;
}
export function escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') {
        return String(unsafe);
    }
    return unsafe.replace(/[&<"']/g, function (match: string): string {
        const escapeMap: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return escapeMap[match] || match;
    });
}
export function formatDateUTC(date: Date): string {
    return date.toISOString();
}
export function formatDateLocal(isoString: string): string {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    };
    return new Intl.DateTimeFormat(undefined, options).format(date);
}