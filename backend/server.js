require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { encryptWithKey, decryptWithKey } = require("./encryption");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "ironcloak";

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

let db;
(async () => {
    try {
        const client = new MongoClient(mongoUrl);
        await client.connect();
        db = client.db(dbName);
        console.log("Connected to MongoDB");

        // Creating indexes
        await db.collection("passwords").createIndex({ userId: 1 });
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
})();


app.post("/api/passwords", async (req, res) => {
    try {
        const { encryptedData, key } = req.body;

        // Decrypting to validate structure
        const decrypted = JSON.parse(decryptWithKey(encryptedData, key));

        // Re-encrypting password for storage
        const encryptedPassword = encryptWithKey(decrypted.password, key);

        const result = await db.collection("passwords").insertOne({
            site: decrypted.site,
            username: decrypted.username,
            password: encryptedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: decrypted.userId || null,
        });

        res.status(201).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error("Save error:", error);
        res.status(500).json({ error: "Failed to save password" });
    }
});

app.get("/api/passwords", async (req, res) => {
    try {
        const { key, userId } = req.query;
        const passwords = await db
            .collection("passwords")
            .find(userId ? { userId } : {})
            .toArray();

        // Decrypting each password individually with error handling
        const decryptedPasswords = passwords.map((item) => {
            try {
                return {
                    _id: item._id,
                    site: item.site,
                    username: item.username,
                    password: decryptWithKey(item.password, key),
                };
            } catch (decryptError) {
                
                console.error(
                    `Failed to decrypt password for ${item.site}:`,
                    decryptError
                );
                return {
                    _id: item._id,
                    site: item.site,
                    username: item.username,
                    password: "[Decryption failed - wrong key]",
                };
            }
        });

        res.json(decryptedPasswords);
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch passwords" });
    }
});

app.put("/api/passwords/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { encryptedData, key } = req.body;
        const decrypted = JSON.parse(decryptWithKey(encryptedData, key));

        await db.collection("passwords").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    site: decrypted.site,
                    username: decrypted.username,
                    password: encryptWithKey(decrypted.password, key),
                    updatedAt: new Date(),
                },
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Failed to update password" });
    }
});

app.delete("/api/passwords/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("passwords").deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Failed to delete password" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
