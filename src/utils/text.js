function cleanText(text) {
    return String(text || "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

module.exports = { cleanText };
