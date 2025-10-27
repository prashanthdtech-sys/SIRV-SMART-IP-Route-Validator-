// server.js
const express = require("express");
const cors = require("cors");
const routeValidatorRoute = require("./Routes/routeValidateRoute.js");

const app = express();
app.use(cors());
app.use(express.json());

// API Route
app.use("/api", routeValidatorRoute);


const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
