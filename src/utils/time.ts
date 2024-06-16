export function msToTime(duration: number): string {
    const millisecondsPerHour = 3600000; // 60 * 60 * 1000
    const millisecondsPerMinute = 60000; // 60 * 1000
    const millisecondsPerSecond = 1000;

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(duration / millisecondsPerHour);
    const minutes = Math.floor((duration % millisecondsPerHour) / millisecondsPerMinute);
    const seconds = Math.floor((duration % millisecondsPerMinute) / millisecondsPerSecond);

    // Format the time
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    return formattedTime;
}