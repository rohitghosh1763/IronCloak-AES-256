const CryptoJS = require("crypto-js");
require("dotenv").config();

// Key from environment (fallback for development)
const DEFAULT_KEY =
    process.env.ENCRYPTION_KEY || "dev-key-32-characters-long-123!";

const encryptWithKey = (text, key = DEFAULT_KEY) => {
    return CryptoJS.AES.encrypt(text, key).toString();
};

const decryptWithKey = (ciphertext, key = DEFAULT_KEY) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Decryption failed");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw new Error("Invalid key or corrupted data");
    }
};

module.exports = { encryptWithKey, decryptWithKey };
