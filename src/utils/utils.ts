import path from 'path';

export function msToTime(duration: number): string {
    const milliseconds = Math.floor((duration % 1000));
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const hoursStr = (hours < 10) ? "0" + hours : hours;
    const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
    const secondsStr = (seconds < 10) ? "0" + seconds : seconds;
    const millisecondsStr = (milliseconds < 100) ? "0" + milliseconds : milliseconds;

    return `${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}`;
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
};