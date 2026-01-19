const { createWorker } = require("tesseract.js");

async function ocrImageToText(imagePath) {
    const worker = await createWorker("eng");

    try {
        const { data } = await worker.recognize(imagePath);

        const text = (data.text || "").replace(/\s+/g, " ").trim();

        // Tesseract confidence is usually 0-100
        const conf = typeof data.confidence === "number" ? data.confidence / 100 : 0.7;

        return {
            raw_text: text,
            confidence: Math.max(0.01, Math.min(conf, 0.99)),
        };
    } finally {
        await worker.terminate();
    }
}

module.exports = { ocrImageToText };
