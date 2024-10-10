function getCurrentSeason() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth();
    if (month < 7) {
        return currentYear - 1;
    } else {
        return currentYear;
    }
}

module.exports = getCurrentSeason;
