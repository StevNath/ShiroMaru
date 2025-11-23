function formatDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta"  // <-- paksa WIB
    }).format(date);
}
module.exports = { formatDate };