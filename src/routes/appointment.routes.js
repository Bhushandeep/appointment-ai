const express = require("express");
const multer = require("multer");

const { parseAppointmentController } = require("../controllers/appointment.controller");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * Single endpoint:
 * - Accept JSON body { text: "..." }
 * OR
 * - multipart/form-data with field "image"
 */
router.post("/parse", upload.single("image"), parseAppointmentController);

module.exports = router;
