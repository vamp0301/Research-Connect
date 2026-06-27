// src/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");

const app = express();

// =======================
// Global Middlewares
// =======================

app.use(cors());

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

// =======================
// Health Check
// =======================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 ResearchConnect Backend Running Successfully"
    });
});

// =======================
// Routes
// =======================

app.use("/api/auth", authRoutes);

// =======================
// 404 Handler
// =======================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

module.exports = app;