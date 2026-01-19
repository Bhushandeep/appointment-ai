function buildNeedsClarification(message, extra = {}) {
    return {
        status: "needs_clarification",
        message: message || "Ambiguous date/time or department",
        ...extra,
    };
}

module.exports = { buildNeedsClarification };
