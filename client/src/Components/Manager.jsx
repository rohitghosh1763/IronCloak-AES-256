import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Manager = () => {
    // State
    const [masterPassword, setMasterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [clientKey, setClientKey] = useState(null);
    const [passwords, setPasswords] = useState([]);
    const [form, setForm] = useState({
        _id: null,
        site: "",
        username: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [isNewUser, setIsNewUser] = useState(!localStorage.getItem("salt"));
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Check password strength
    useEffect(() => {
        if (masterPassword) {
            let strength = 0;
            // Length check
            if (masterPassword.length >= 8) strength += 1;
            if (masterPassword.length >= 12) strength += 1;
            // Complexity checks
            if (/[A-Z]/.test(masterPassword)) strength += 1;
            if (/[a-z]/.test(masterPassword)) strength += 1;
            if (/[0-9]/.test(masterPassword)) strength += 1;
            if (/[^A-Za-z0-9]/.test(masterPassword)) strength += 1;

            setPasswordStrength(Math.min(5, strength));
        } else {
            setPasswordStrength(0);
        }
    }, [masterPassword]);

    // Key derivation
    const deriveKey = (password, salt) => {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 10000,
            hasher: CryptoJS.algo.SHA256,
        }).toString();
    };

    // Setup vault for first time users
    const setupVault = () => {
        // Validate passwords
        if (masterPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        if (masterPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        // Generate salt and store it
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        localStorage.setItem("salt", salt);

        // Derive key and set up empty vault
        const key = deriveKey(masterPassword, salt);

        // Store a test value to verify password on login
        localStorage.setItem(
            "testEncryption",
            CryptoJS.AES.encrypt("test", key).toString()
        );

        setClientKey(key);
        setIsUnlocked(true);
        setPasswords([]);
        setIsNewUser(false);
        toast.success("Vault created successfully!");
    };

    // Unlock vault
    const unlockVault = () => {
        // Validate master password
        if (!masterPassword.trim()) {
            setPasswordError("Please enter your master password");
            return;
        }

        const salt = localStorage.getItem("salt");
        const key = deriveKey(masterPassword, salt);

        // Try to decrypt the test value to verify password
        try {
            const testEncryption = localStorage.getItem("testEncryption");
            const decrypted = CryptoJS.AES.decrypt(
                testEncryption,
                key
            ).toString(CryptoJS.enc.Utf8);

            if (decrypted !== "test") {
                setPasswordError("Incorrect password");
                return;
            }

            // Password is correct
            setPasswordError("");
            setClientKey(key);
            setIsUnlocked(true);
            fetchPasswords(key);
        } catch (error) {
            setPasswordError("Incorrect password");
        }
    };

    // Lock vault
    const lockVault = () => {
        setClientKey(null);
        setIsUnlocked(false);
        setPasswords([]);
        setMasterPassword("");
        setConfirmPassword("");
        setPasswordError("");
    };

    // Fetch passwords
    const fetchPasswords = async (key) => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/passwords?key=${encodeURIComponent(
                    key
                )}`
            );
            const data = await res.json();
            setPasswords(data);
        } catch (error) {
            toast.error("Failed to load passwords");
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.site || !form.username || !form.password) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify({
                    site: form.site,
                    username: form.username,
                    password: form.password,
                }),
                clientKey
            ).toString();

            const method = form._id ? "PUT" : "POST";
            const url = form._id
                ? `/api/passwords/${form._id}`
                : "/api/passwords";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ encryptedData, key: clientKey }),
            });

            if (res.ok) {
                toast.success(
                    form._id ? "Password updated!" : "Password saved!"
                );
                setForm({ _id: null, site: "", username: "", password: "" });
                fetchPasswords(clientKey);
            }
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    // Delete password
    const handleDelete = async (id) => {
        if (window.confirm("Delete this password permanently?")) {
            try {
                await fetch(`http://localhost:3000/api/passwords/${id}`, {
                    method: "DELETE",
                });
                toast.success("Password deleted");
                fetchPasswords(clientKey);
            } catch (error) {
                toast.error("Deletion failed");
            }
        }
    };

    // Edit password
    const handleEdit = (password) => {
        setForm({
            _id: password._id,
            site: password.site,
            username: password.username,
            password: password.password,
        });
    };

    // Copy to clipboard
    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(
            () => {
                toast.success(`${type} copied to clipboard!`);
            },
            (err) => {
                toast.error("Failed to copy text");
                console.error("Could not copy text: ", err);
            }
        );
    };

    // Handle Enter key press on master password input
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (isNewUser) {
                setupVault();
            } else {
                unlockVault();
            }
        }
    };

    // Generate random password
    const generatePassword = () => {
        const length = 16;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        setForm({ ...form, password });
        setShowPassword(true);
    };

    // Strength indicator colors
    const getStrengthColor = () => {
        if (passwordStrength <= 1) return "bg-red-500";
        if (passwordStrength <= 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    // Password strength label
    const getStrengthLabel = () => {
        if (passwordStrength <= 1) return "Weak";
        if (passwordStrength <= 3) return "Moderate";
        return "Strong";
    };

    // Unlocked UI
    if (isUnlocked) {
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <ToastContainer position="top-right" />

                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold">🔒 Password Manager</h1>
                    <button
                        onClick={lockVault}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Lock Vault
                    </button>
                </header>

                {/* Password Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-lg shadow-md mb-8"
                >
                    <h2 className="text-xl font-semibold mb-4">
                        {form._id ? "Edit Password" : "Add Password"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block mb-2">Website</label>
                            <input
                                type="url"
                                value={form.site}
                                onChange={(e) =>
                                    setForm({ ...form, site: e.target.value })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Username</label>
                            <input
                                type="text"
                                value={form.username}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        username: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full p-2 border rounded pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                            >
                                Generate Strong Password
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded flex-1"
                        >
                            {form._id ? "Update" : "Save"}
                        </button>
                        {form._id && (
                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        _id: null,
                                        site: "",
                                        username: "",
                                        password: "",
                                    })
                                }
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Password List */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <h2 className="text-xl font-semibold p-4 border-b">
                        Your Passwords
                    </h2>

                    {passwords.length === 0 ? (
                        <p className="p-4 text-gray-500">No passwords yet</p>
                    ) : (
                        <ul className="divide-y ">
                            {passwords.map((item) => (
                                <li
                                    key={item._id}
                                    className="p-4 hover:bg-gray-50"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">
                                                {item.site}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {item.username}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        item.username,
                                                        "Username"
                                                    )
                                                }
                                                className="text-gray-500 hover:text-gray-700"
                                                title="Copy username"
                                            >
                                                📋 User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        item.password,
                                                        "Password"
                                                    )
                                                }
                                                className="text-gray-500 hover:text-gray-700"
                                                title="Copy password"
                                            >
                                                📋 Pass
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(item._id)
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    // Locked UI - Setup or Login
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isNewUser
                        ? "Create Master Password"
                        : "Unlock Password Manager"}
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {isNewUser
                            ? "Create Master Password"
                            : "Master Password"}
                    </label>
                    <input
                        type="password"
                        value={masterPassword}
                        onChange={(e) => {
                            setMasterPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            isNewUser
                                ? "Create master password"
                                : "Enter master password"
                        }
                        className={`w-full p-3 border rounded-lg ${
                            passwordError ? "border-red-500" : ""
                        }`}
                        autoFocus
                    />

                    {isNewUser && (
                        <>
                            <div className="mt-2 mb-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getStrengthColor()}`}
                                        style={{
                                            width: `${
                                                (passwordStrength / 5) * 100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    Password strength: {getStrengthLabel()}
                                </p>
                                <ul className="text-xs text-gray-600 mt-2">
                                    <li>
                                        ✓ At least 8 characters (12+
                                        recommended)
                                    </li>
                                    <li>
                                        ✓ Mix of uppercase and lowercase letters
                                    </li>
                                    <li>
                                        ✓ Include numbers and special characters
                                    </li>
                                </ul>
                            </div>

                            <label className="block text-sm font-medium mb-1 mt-4">
                                Confirm Master Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (passwordError) setPasswordError("");
                                }}
                                onKeyPress={handleKeyPress}
                                placeholder="Confirm master password"
                                className={`w-full p-3 border rounded-lg ${
                                    passwordError ? "border-red-500" : ""
                                }`}
                            />
                        </>
                    )}

                    {passwordError && (
                        <p className="text-red-500 text-sm mt-1">
                            {passwordError}
                        </p>
                    )}
                </div>

                {isNewUser ? (
                    <div>
                        <p className="text-sm text-gray-600 mb-4">
                            This password will encrypt all your data. If you
                            forget it, there is no way to recover your
                            passwords.
                        </p>
                        <button
                            onClick={setupVault}
                            className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={
                                !masterPassword ||
                                masterPassword.length < 8 ||
                                masterPassword !== confirmPassword
                            }
                        >
                            Create Vault
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={unlockVault}
                        className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!masterPassword.trim()}
                    >
                        Unlock
                    </button>
                )}
            </div>
        </div>
    );
};

export default Manager;
