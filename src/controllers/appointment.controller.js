const fs = require("fs");
const { z } = require("zod");

const { ocrImageToText } = require("../services/ocr.service");
const { extractEntities } = require("../services/entity.service");
const { normalizeEntities } = require("../services/normalize.service");
const { buildNeedsClarification } = require("../utils/guardrails");
const { cleanText } = require("../utils/text");

const ParseBodySchema = z.object({
    text: z.string().optional(),
});

async function parseAppointmentController(req, res) {
    // Determine input mode: text OR image
    const hasImage = !!req.file;
    const parsedBody = ParseBodySchema.safeParse(req.body || {});
    const hasText = parsedBody.success && typeof parsedBody.data.text === "string" && parsedBody.data.text.trim().length > 0;

    if (!hasImage && !hasText) {
        return res.status(400).json({
            status: "bad_request",
            message: "Provide either JSON { text } or upload an image file with field name 'image'.",
        });
    }

    // ---------------------------
    // STEP 1: OCR / Text Extraction
    // ---------------------------
    let rawText = "";
    let ocrConfidence = 0.9;

    try {
        if (hasText) {
            rawText = cleanText(parsedBody.data.text);
            ocrConfidence = 0.95;
        } else {
            const ocr = await ocrImageToText(req.file.path);
            rawText = cleanText(ocr.raw_text);
            ocrConfidence = ocr.confidence;
        }
    } finally {
        // Cleanup uploaded file
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
    }

    const step1 = {
        raw_text: rawText,
        confidence: Number(ocrConfidence.toFixed(2)),
    };

    // Guardrail: OCR too noisy / empty
    if (!rawText || rawText.length < 3) {
        return res.json(
            buildNeedsClarification("OCR text too noisy or empty. Please upload a clearer image or type the request.", {
                step1,
                missing: ["raw_text"],
            })
        );
    }

    if (step1.confidence < 0.55) {
        return res.json(
            buildNeedsClarification("OCR confidence too low. Please upload a clearer image.", {
                step1,
                missing: ["raw_text"],
            })
        );
    }

    // ---------------------------
    // STEP 2: Entity Extraction
    // ---------------------------
    const entityResult = extractEntities(rawText);

    if (!entityResult.ok) {
        return res.json(
            buildNeedsClarification(entityResult.message, {
                step1,
                step2: {
                    entities: entityResult.entities || {},
                    entities_confidence: Number((entityResult.confidence || 0.5).toFixed(2)),
                },
                missing: entityResult.missing || [],
            })
        );
    }

    const step2 = {
        entities: entityResult.entities,
        entities_confidence: Number(entityResult.confidence.toFixed(2)),
    };

    // ---------------------------
    // STEP 3: Normalization
    // ---------------------------
    const normResult = normalizeEntities(rawText, step2.entities);

    if (!normResult.ok) {
        return res.json(
            buildNeedsClarification(normResult.message, {
                step1,
                step2,
                step3: {
                    normalized: normResult.normalized || {},
                    normalization_confidence: Number((normResult.confidence || 0.5).toFixed(2)),
                },
                missing: normResult.missing || [],
            })
        );
    }

    const step3 = {
        normalized: normResult.normalized,
        normalization_confidence: Number(normResult.confidence.toFixed(2)),
    };

    // ---------------------------
    // STEP 4: Final Appointment JSON
    // ---------------------------
    const step4 = {
        appointment: {
            department: normResult.department,
            date: normResult.normalized.date,
            time: normResult.normalized.time,
            tz: normResult.normalized.tz,
        },
        status: "ok",
    };

    return res.json({
        step1,
        step2,
        step3,
        step4,
    });
}

module.exports = { parseAppointmentController };
