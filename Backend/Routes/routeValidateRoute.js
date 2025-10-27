// routeValidatorRoute.js
const express = require("express");
const router = express.Router();
const getRPKI = require("../Controller/routeValidateController.js");

// Route for RPKI Validation
router.get("/rpki-check", getRPKI);

module.exports = router;
