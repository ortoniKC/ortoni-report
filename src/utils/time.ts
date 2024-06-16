export function msToTime(duration: number): string {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const hoursStr = hours > 0 ? `${hours.toString().padStart(2, '0')} H - ` : '';
    const minutesStr = minutes > 0 || hours > 0 ? `${minutes.toString().padStart(2, '0')} M - ` : '';
    const secondsStr = seconds > 0 || minutes > 0 || hours > 0 ? `${seconds.toString().padStart(2, '0')} S` : '';

    return `${hoursStr}${minutesStr}${secondsStr}`;
}
