const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDb = require("./src/config/db");
const userRoutes = require("./src/routes/routes.js");

const app = express();
const port = process.env.PORT || 4000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(helmet()); // Sets various HTTP headers for security

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3900",
    credentials: true
}));
app.use(express.json());
app.use(morgan(isProduction ? "combined" : "dev"));

// Routes
app.get("/", (req, res) => {
    res.send("Home Page!");
});
app.use("/api", userRoutes);

// 404 Not Found Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Establish DB connection before starting the server
connectDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Exit process with failure
    });

// Export for Vercel compatibility
module.exports = app;
