import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    LockClosedIcon,
    LockOpenIcon,
    EyeIcon,
    EyeSlashIcon,
    ClipboardDocumentIcon,
    ClipboardDocumentCheckIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusCircleIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    ArrowUturnLeftIcon // Kept for the "Lock Vault" button if you decide to have a similar button within Manager
} from "@heroicons/react/24/outline";

const Manager = () => {
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
    const [copiedStates, setCopiedStates] = useState({});

    useEffect(() => {
        if (masterPassword) {
            let strength = 0;
            if (masterPassword.length >= 8) strength += 1;
            if (masterPassword.length >= 12) strength += 1;
            if (/[A-Z]/.test(masterPassword)) strength += 1;
            if (/[a-z]/.test(masterPassword)) strength += 1;
            if (/[0-9]/.test(masterPassword)) strength += 1;
            if (/[^A-Za-z0-9]/.test(masterPassword)) strength += 1;
            setPasswordStrength(Math.min(5, strength));
        } else {
            setPasswordStrength(0);
        }
    }, [masterPassword]);

    const deriveKey = (password, salt) => {
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 10000,
            hasher: CryptoJS.algo.SHA256,
        }).toString();
    };

    const setupVault = () => {
        if (masterPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            toast.error("Passwords don't match", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
            return;
        }
        if (masterPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            toast.error("Password must be at least 8 characters", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
            return;
        }
        const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
        localStorage.setItem("salt", salt);
        const key = deriveKey(masterPassword, salt);
        localStorage.setItem(
            "testEncryption",
            CryptoJS.AES.encrypt("test", key).toString()
        );
        setClientKey(key);
        setIsUnlocked(true);
        setPasswords([]);
        setIsNewUser(false);
        toast.success("Vault created successfully!", { icon: <ShieldCheckIcon className="h-6 w-6 text-white" /> });
    };

    const unlockVault = () => {
        if (!masterPassword.trim()) {
            setPasswordError("Please enter your master password");
            toast.warn("Please enter your master password", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
            return;
        }
        const salt = localStorage.getItem("salt");
        if (!salt) {
            setPasswordError("Vault is not set up correctly. Please reset.");
            setIsNewUser(true);
            return;
        }
        const key = deriveKey(masterPassword, salt);
        try {
            const testEncryption = localStorage.getItem("testEncryption");
            const decrypted = CryptoJS.AES.decrypt(
                testEncryption,
                key
            ).toString(CryptoJS.enc.Utf8);
            if (decrypted !== "test") {
                setPasswordError("Incorrect password");
                toast.error("Incorrect password", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
                return;
            }
            setPasswordError("");
            setClientKey(key);
            setIsUnlocked(true);
            fetchPasswords(key);
            toast.success("Vault Unlocked!", { icon: <LockOpenIcon className="h-6 w-6 text-white" /> });
        } catch (error) {
            setPasswordError("Incorrect password or corrupted vault data.");
            toast.error("Incorrect password", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
        }
    };

    const lockVault = () => {
        setClientKey(null);
        setIsUnlocked(false);
        setPasswords([]);
        setMasterPassword("");
        setConfirmPassword("");
        setPasswordError("");
        toast.info("Vault Locked", { icon: <LockClosedIcon className="h-6 w-6 text-white" /> });
    };

    const fetchPasswords = async (key) => {
        try {
            // Ensure this URL is correct and your backend is running
            const res = await fetch(
                `http://localhost:3000/api/passwords?key=${encodeURIComponent(key)}`
            );
            if (!res.ok) {
                throw new Error('Failed to fetch passwords. Status: ' + res.status);
            }
            const data = await res.json();
            setPasswords(data);
        } catch (error) {
            console.error("Fetch Passwords Error:", error);
            toast.error("Failed to load passwords. Check console for details.", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.site || !form.username || !form.password) {
            toast.error("Please fill all fields", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
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
            // Ensure these URLs are correct for your API
            const url = form._id
                ? `http://localhost:3000/api/passwords/${form._id}`
                : "http://localhost:3000/api/passwords";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ encryptedData, key: clientKey }),
            });
            if (res.ok) {
                toast.success(
                    form._id ? "Password updated!" : "Password saved!",
                    { icon: <ShieldCheckIcon className="h-6 w-6 text-white" /> }
                );
                setForm({ _id: null, site: "", username: "", password: "" });
                fetchPasswords(clientKey);
                setShowPassword(false);
            } else {
                const errorData = await res.json().catch(() => ({ message: "Server error" }));
                toast.error(`Operation failed: ${errorData.message || res.statusText}`, { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
            }
        } catch (error) {
            console.error("Submit/Update Error:", error);
            toast.error("Operation failed. Check console for details.", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this password permanently?")) {
            try {
                 // Ensure this URL is correct for your API
                await fetch(`http://localhost:3000/api/passwords/${id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }, // Optional: some APIs might need this for DELETE
                    body: JSON.stringify({ key: clientKey }) // Send clientKey if your API requires it for auth on DELETE
                });
                toast.success("Password deleted", { icon: <TrashIcon className="h-6 w-6 text-white" /> });
                fetchPasswords(clientKey);
            } catch (error) {
                console.error("Delete Error:", error);
                toast.error("Deletion failed. Check console for details.", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
            }
        }
    };

    const handleEdit = (password) => {
        setForm({
            _id: password._id,
            site: password.site,
            username: password.username,
            password: password.password,
        });
        setShowPassword(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const copyToClipboard = (text, type, id) => {
        navigator.clipboard.writeText(text).then(
            () => {
                toast.success(`${type} copied to clipboard!`, { icon: <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" /> });
                setCopiedStates(prev => ({ ...prev, [id + type]: true }));
                setTimeout(() => {
                    setCopiedStates(prev => ({ ...prev, [id + type]: false }));
                }, 2000);
            },
            (err) => {
                toast.error("Failed to copy text", { icon: <ExclamationTriangleIcon className="h-6 w-6 text-white" /> });
                console.error("Could not copy text: ", err);
            }
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            if (isNewUser) {
                if (masterPassword && confirmPassword && masterPassword === confirmPassword && masterPassword.length >= 8) {
                    setupVault();
                } else if (!masterPassword || !confirmPassword) {
                    setPasswordError("Please fill both password fields.");
                } else if (masterPassword !== confirmPassword) {
                    setPasswordError("Passwords don't match.");
                } else if (masterPassword.length < 8) {
                    setPasswordError("Password must be at least 8 characters.");
                }
            } else {
                if (masterPassword) {
                    unlockVault();
                } else {
                     setPasswordError("Please enter your master password.");
                }
            }
        }
    };
    
    const generatePassword = () => {
        const length = 16;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";
        const cryptoObj = window.crypto || window.msCrypto;
        const randomValues = new Uint32Array(length);
        cryptoObj.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            password += charset[randomValues[i] % charset.length];
        }
        setForm({ ...form, password });
        setShowPassword(true);
        toast.info("Strong password generated!", { icon: <ArrowPathIcon className="h-6 w-6 text-white" /> });
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return "bg-red-500";
        if (passwordStrength <= 2) return "bg-orange-500";
        if (passwordStrength <= 3) return "bg-yellow-500";
        if (passwordStrength <= 4) return "bg-lime-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (passwordStrength <= 1) return "Weak";
        if (passwordStrength <= 2) return "Fair";
        if (passwordStrength <= 3) return "Moderate";
        if (passwordStrength <= 4) return "Good";
        return "Strong";
    };

    if (isUnlocked) {
        return (
            // This div is the main content area for the Manager when unlocked
            // The 'py-8' gives padding, adjust if needed based on your Footer's 'top-20'
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-gray-100 py-8 pb-24"> {/* Added pb-24 for more space above footer */}
                <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-5xl">
                    <ToastContainer
                        position="top-center"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                    />
                    
                    {/* The Lock Vault button might be better in your Navbar, but can be kept here if desired */}
                     <div className="flex justify-end mb-6">
                        <button
                            onClick={lockVault}
                            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105"
                        >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                            <span>Lock Vault</span>
                        </button>
                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl mb-12 border border-slate-700"
                    >
                        <h2 className="text-2xl font-semibold mb-6 text-sky-300 flex items-center">
                            {form._id ? <PencilSquareIcon className="h-7 w-7 mr-2" /> : <PlusCircleIcon className="h-7 w-7 mr-2" />}
                            {form._id ? "Edit Credential" : "Add New Credential"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="site" className="block mb-2 text-sm font-medium text-slate-300">Website URL</label>
                                <input
                                    id="site"
                                    type="url"
                                    value={form.site}
                                    onChange={(e) => setForm({ ...form, site: e.target.value })}
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                    placeholder="e.g., https://example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-slate-300">Username / Email</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                    placeholder="e.g., user@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-300">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors pr-12"
                                    placeholder="Enter password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-sky-400 p-1.5 rounded-md"
                                    title={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                                </button>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="text-sm flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out transform hover:scale-105"
                                >
                                    <ArrowPathIcon className="h-5 w-5" />
                                    <span>Generate Strong Password</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg font-semibold transition-all duration-150 ease-in-out transform hover:scale-105"
                            >
                                {form._id ? "Update Credential" : "Save Credential"}
                            </button>
                            {form._id && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm({ _id: null, site: "", username: "", password: "" });
                                        setShowPassword(false);
                                    }}
                                    className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg shadow hover:shadow-md transition-all duration-150 ease-in-out"
                                >
                                    <XMarkIcon className="h-5 w-5"/>
                                    <span>Cancel</span>
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                        <h2 className="text-2xl font-semibold p-6 bg-slate-800/50 border-b border-slate-700 text-sky-300">
                            Stored Credentials ({passwords.length})
                        </h2>

                        {passwords.length === 0 ? (
                            <p className="p-8 text-center text-slate-400 text-lg">Your vault is empty. Add some credentials!</p>
                        ) : (
                            <ul className="divide-y divide-slate-700">
                                {passwords.map((item) => (
                                    <li
                                        key={item._id}
                                        className="p-4 md:p-6 hover:bg-slate-700/50 transition-colors duration-150 ease-in-out group"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                            <div className="mb-3 sm:mb-0">
                                                <h3 className="font-medium text-lg text-sky-300 flex items-center">
                                                    <img 
                                                        src={`https://www.google.com/s2/favicons?domain=${item.site}&sz=32`} 
                                                        alt="" 
                                                        className="h-6 w-6 mr-3 rounded-sm object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            // Optionally, show a placeholder icon
                                                            // e.currentTarget.insertAdjacentHTML('afterend', '<div class="h-6 w-6 mr-3 rounded-sm bg-slate-700 flex items-center justify-center text-sky-400">?</div>');
                                                        }}
                                                    />
                                                    {item.site}
                                                </h3>
                                                <p className="text-sm text-slate-400 ml-9 truncate max-w-xs" title={item.username}>
                                                    {item.username}
                                                </p>
                                            </div>
                                            <div className="flex space-x-1 sm:space-x-2 items-center self-end sm:self-center">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(item.username, "Username", item._id + 'user')}
                                                    className="p-2 text-slate-400 hover:text-sky-400 transition-colors rounded-md"
                                                    title="Copy username"
                                                >
                                                    {copiedStates[item._id + 'user'] ? <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(item.password, "Password", item._id + 'pass')}
                                                    className="p-2 text-slate-400 hover:text-sky-400 transition-colors rounded-md"
                                                    title="Copy password"
                                                >
                                                     {copiedStates[item._id + 'pass'] ? <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 text-slate-400 hover:text-yellow-400 transition-colors rounded-md"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-md"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- LOCKED UI ---
    // This part remains mostly the same, as it's a full-screen takeover
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <ToastContainer position="top-center" autoClose={3000} theme="dark" />
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="flex flex-col items-center mb-6">
                    {/* You can use your existing Navbar's logo style here if you prefer for consistency */}
                    <ShieldCheckIcon className="h-16 w-16 text-sky-400 mb-3"/>
                    <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                        {isNewUser ? "Set Up Your Vault" : "Unlock IronCloak"} {/* Matches your Navbar's name */}
                    </h2>
                </div>

                <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                        {isNewUser ? "Create Master Password" : "Master Password"}
                    </label>
                    <input
                        type="password"
                        value={masterPassword}
                        onChange={(e) => {
                            setMasterPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder={isNewUser ? "Choose a strong master password" : "Enter your master password"}
                        className={`w-full p-3.5 bg-slate-700 border rounded-lg text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                            passwordError ? "border-red-500 ring-red-500/50" : "border-slate-600"
                        }`}
                        autoFocus
                    />
                </div>

                {isNewUser && (
                    <>
                        <div className="mb-2">
                            <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-slate-400">Password strength:</span>
                                <span className={`font-semibold ${
                                    passwordStrength <= 1 ? "text-red-400" :
                                    passwordStrength <= 3 ? "text-yellow-400" : "text-green-400"
                                }`}>{getStrengthLabel()}</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2.5">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-300 ease-out-cubic ${getStrengthColor()}`}
                                    style={{ width: `${(passwordStrength / 5) * 100}%`}}
                                ></div>
                            </div>
                             <ul className="text-xs text-slate-500 mt-2 space-y-0.5">
                                <li className={`${masterPassword.length >= 8 ? 'text-green-400' : 'text-slate-500'}`}>✓ At least 8 characters (12+ recommended)</li>
                                <li className={`${/[A-Z]/.test(masterPassword) && /[a-z]/.test(masterPassword) ? 'text-green-400' : 'text-slate-500'}`}>✓ Mix of uppercase & lowercase</li>
                                <li className={`${/[0-9]/.test(masterPassword) && /[^A-Za-z0-9]/.test(masterPassword) ? 'text-green-400' : 'text-slate-500'}`}>✓ Numbers & special characters</li>
                            </ul>
                        </div>

                        <div className="mb-5 mt-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
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
                                placeholder="Confirm your master password"
                                className={`w-full p-3.5 bg-slate-700 border rounded-lg text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                                    passwordError && masterPassword !== confirmPassword ? "border-red-500 ring-red-500/50" : "border-slate-600"
                                }`}
                            />
                        </div>
                    </>
                )}

                {passwordError && (
                    <p className="text-red-400 text-sm mt-1 mb-3 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-1.5"/>
                        {passwordError}
                    </p>
                )}

                {isNewUser ? (
                    <div>
                        <p className="text-xs text-slate-500 mb-4">
                            This password encrypts all your data locally. If you forget it, recovery is impossible. Choose wisely.
                        </p>
                        <button
                            onClick={setupVault}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white p-3.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            disabled={
                                !masterPassword ||
                                masterPassword.length < 8 ||
                                masterPassword !== confirmPassword ||
                                passwordStrength < 3
                            }
                        >
                            Create IronCloak Vault
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={unlockVault}
                        className="w-full bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white p-3.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                        disabled={!masterPassword.trim()}
                    >
                        Unlock Vault
                    </button>
                )}
                 <p className="text-xs text-slate-600 text-center mt-6">
                    All data is encrypted and stored locally in your browser.
                </p>
            </div>
        </div>
    );
};

export default Manager;