function extractTimePhrase(text) {
    // 3pm, 3 pm, 3:30pm, 15:00
    const timeRegex = /\b(\d{1,2})(:\d{2})?\s?(am|pm)?\b/i;
    const m = text.match(timeRegex);
    return m ? m[0].trim() : null;
}

function extractDatePhrase(text) {
    const lower = text.toLowerCase();

    // Simple keyword-based date phrases
    const patterns = [
        "today",
        "tomorrow",
        "day after tomorrow",
        "next monday",
        "next tuesday",
        "next wednesday",
        "next thursday",
        "next friday",
        "next saturday",
        "next sunday",
    ];

    for (const p of patterns) {
        if (lower.includes(p)) return p;
    }

    // fallback: if "next" exists + weekday exists
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (lower.includes("next")) {
        for (const w of weekdays) {
            if (lower.includes(w)) return `next ${w}`;
        }
    }

    // fallback: date like 26/09 or 26-09 or 26th
    const dateRegex = /\b(\d{1,2})(st|nd|rd|th)?\b/i;
    if (dateRegex.test(text)) {
        // not perfect, but gives a phrase for extraction step
        return "date mentioned";
    }

    return null;
}

function detectAmbiguousTime(timePhrase) {
    if (!timePhrase) return true;
    const lower = timePhrase.toLowerCase();

    const ambiguous = ["morning", "evening", "night", "afternoon", "sometime", "later"];
    return ambiguous.some((x) => lower.includes(x));
}

module.exports = {
    extractTimePhrase,
    extractDatePhrase,
    detectAmbiguousTime,
};
