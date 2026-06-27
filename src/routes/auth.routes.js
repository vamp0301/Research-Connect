// src/routes/auth.routes.js

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "Authentication Module Working"

    });

});

module.exports = router;