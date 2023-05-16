const timeFormatter = (secs) => {
    const units = {
        days: "d",
        hours: "h",
        minutes: "m",
        seconds: "s",
    };

    const days = Math.trunc(secs / (24 * 60 * 60)) || undefined;
    const hours = Math.trunc((secs % (24 * 60 * 60)) / (60 * 60)) || undefined;
    const minutes = Math.trunc(((secs % (24 * 60 * 60)) % (60 * 60)) / 60) || undefined;
    const seconds = ((secs % (24 * 60 * 60)) % (60 * 60)) % 60 || undefined;

    const time = JSON.parse(JSON.stringify({ days, hours, minutes, seconds }));
    let result = [];

    for (const key in time) {
        result.push(time[key] + units[key]);
    }

    return result.join(' ');
}

export default timeFormatter;