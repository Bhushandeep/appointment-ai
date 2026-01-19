const chrono = require("chrono-node");
const { DateTime } = require("luxon");
const { normalizeDepartment } = require("../utils/department");
const { detectAmbiguousTime } = require("../utils/time_date");

const TZ = "Asia/Kolkata";

function normalizeEntities(text, entities) {
    // Guardrail: ambiguous time phrases like "evening", "morning", "sometime"
    if (detectAmbiguousTime(entities.time_phrase)) {
        return {
            ok: false,
            message: "Time is ambiguous (e.g., morning/evening). Please provide an exact time like 3pm or 15:00.",
            confidence: 0.6,
            missing: ["time_phrase"],
        };
    }

    const chronoResults = chrono.parse(text, new Date(), { forwardDate: true });

    if (!chronoResults || chronoResults.length === 0) {
        return {
            ok: false,
            message: "Unable to normalize date/time. Please clarify the date/time.",
            confidence: 0.55,
            missing: ["date_phrase", "time_phrase"],
        };
    }

    // If multiple results detected, it may indicate ambiguity
    if (chronoResults.length > 1) {
        return {
            ok: false,
            message: "Multiple possible date/time values detected. Please specify one exact date/time.",
            confidence: 0.6,
            missing: ["date_phrase", "time_phrase"],
        };
    }

    const dt = chronoResults[0].start.date();
    const luxonDt = DateTime.fromJSDate(dt).setZone(TZ);

    if (!luxonDt.isValid) {
        return {
            ok: false,
            message: "Timezone conversion failed. Please try again.",
            confidence: 0.5,
            missing: ["date_phrase", "time_phrase"],
        };
    }

    const department = normalizeDepartment(entities.department);

    return {
        ok: true,
        normalized: {
            date: luxonDt.toFormat("yyyy-MM-dd"),
            time: luxonDt.toFormat("HH:mm"),
            tz: TZ,
        },
        department,
        confidence: 0.91,
    };
}

module.exports = { normalizeEntities };
