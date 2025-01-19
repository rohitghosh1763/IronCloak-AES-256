const express = require("express");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

// MongoDB connection setup
const url = "mongodb://localhost:27017";
const dbName = "ironcloak";
let db;

// Middleware
app.use(express.json());

// Initialize MongoDB connection once
const initializeDbConnection = async () => {
    try {
        const client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1); // Exit process if the connection fails
    }
};

// Route Handlers
// Get all passwords
app.get("/", async (req, res) => {
    try {
        const passwords = await db.collection("passwords").find({}).toArray();
        res.json(passwords);
    } catch (error) {
        console.error("Error fetching passwords:", error);
        res.status(500).send({ error: "Failed to fetch passwords" });
    }
});

// Save a password
app.post("/", async (req, res) => {
    try {
        const password = req.body;
        const result = await db.collection("passwords").insertOne(password);
        res.send({ success: true, result });
    } catch (error) {
        console.error("Error saving password:", error);
        res.status(500).send({ error: "Failed to save password" });
    }
});

// Delete a password
app.delete("/", async (req, res) => {
    try {
        const password = req.body;
        const result = await db.collection("passwords").deleteOne(password);
        res.send({ success: true, result });
    } catch (error) {
        console.error("Error deleting password:", error);
        res.status(500).send({ error: "Failed to delete password" });
    }
});

// Start the server after initializing the DB connection
initializeDbConnection().then(() => {
    app.listen(port, () => {
        console.log(`Server listening on http://localhost:${port}`);
    });
});
