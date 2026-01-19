const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const appointmentRoutes = require("./routes/appointment.routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "3mb" }));

app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "appointment-ai" });
});

app.use("/v1/appointment", appointmentRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({
        status: "not_found",
        message: "Route not found",
    });
});

// error handler
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
});

module.exports = app;
