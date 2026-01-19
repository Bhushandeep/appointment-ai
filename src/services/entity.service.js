const chrono = require("chrono-node");
const { detectDepartmentFuzzy } = require("../utils/department");
const { extractTimePhrase, extractDatePhrase } = require("../utils/time_date");

function extractEntities(text) {
    const lower = text.toLowerCase();

    const department = detectDepartmentFuzzy(lower);

    const datePhrase = extractDatePhrase(text);
    const timePhrase = extractTimePhrase(text);

    const missing = [];
    if (!department) missing.push("department");
    if (!datePhrase) missing.push("date_phrase");
    if (!timePhrase) missing.push("time_phrase");

    if (missing.length > 0) {
        return {
            ok: false,
            message: `Missing required fields: ${missing.join(", ")}`,
            entities: {
                date_phrase: datePhrase || null,
                time_phrase: timePhrase || null,
                department: department || null,
            },
            confidence: 0.6,
            missing,
        };
    }

    // If chrono can't parse date/time at all → ambiguous
    const chronoResults = chrono.parse(text, new Date(), { forwardDate: true });
    if (!chronoResults || chronoResults.length === 0) {
        return {
            ok: false,
            message: "Ambiguous date/time. Please provide clearer date/time.",
            entities: { date_phrase: datePhrase, time_phrase: timePhrase, department },
            confidence: 0.6,
            missing: ["date_phrase", "time_phrase"],
        };
    }

    return {
        ok: true,
        entities: {
            date_phrase: datePhrase,
            time_phrase: timePhrase,
            department,
        },
        confidence: 0.86,
    };
}

module.exports = { extractEntities };
