# 🔒 IronCloak Password Manager

A secure, client-side encrypted password manager that keeps your credentials safe while providing a clean, intuitive interface.

Check it out: ![IronCloak Password Manager](https://ironcloak-aes-256-1.onrender.com/) 

## 🛡️ Features

-   **Client-side encryption** - All sensitive data is encrypted in your browser before storage
-   **Zero-knowledge architecture** - Your master password never leaves your device
-   **Strong encryption** - Uses industry-standard AES-256 encryption via CryptoJS
-   **PBKDF2 key derivation** - Protects against brute force attacks
-   **Password strength meter** - Helps you create strong master passwords
-   **Password generator** - Creates strong, random passwords with a single click
-   **Modern React UI** - Clean, responsive interface built with React and Tailwind CSS
-   **Secure by design** - No passwords are stored in plaintext at any point

## 🚀 Quick Start

### Prerequisites

-   Node.js (v14+)
-   MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/rohitghosh1763/IronCloak-AES-256.git
cd ironcloak
```

2. Install dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Create a `.env` file in the root directory with:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
ENCRYPTION_KEY=your-32-character-secure-key-here
```

4. Start the development servers

```bash
# In one terminal, start the backend
npm run server

# In another terminal, start the frontend
cd client
npm run dev
```

5. Open your browser to http://localhost:5173

## 🔐 How It Works

1. **First-time setup**: Create a strong master password to initialize your vault
2. **Key derivation**: Your master password is run through PBKDF2 to create a strong encryption key
3. **Local verification**: A test value is encrypted and stored to verify your password on future logins
4. **Data storage**: Passwords are encrypted client-side before being sent to the server
5. **Decryption**: When you unlock your vault, data is decrypted locally using your master key

## 🧠 Technical Details

### Security Model

-   **Client-side encryption**: All encryption/decryption happens in the browser
-   **Key derivation**: PBKDF2 with 10,000 iterations and SHA-256 hashing
-   **AES-256 encryption**: Industry-standard symmetric encryption
-   **Salt generation**: Unique salt for each user stored locally
-   **No password recovery**: If you forget your master password, your data cannot be recovered

### Tech Stack

-   **Frontend**: React, Tailwind CSS, CryptoJS
-   **Backend**: Node.js, Express
-   **Database**: MongoDB
-   **API**: RESTful JSON API
-   **Authentication**: Client-side verification via encrypted test value

## 📱 Roadmap

-   [ ] Mobile application
-   [ ] Browser extensions
-   [ ] Biometric authentication
-   [ ] Multi-factor authentication
-   [ ] Shared vaults for team use
-   [ ] Password health analysis
-   [ ] Audit logging
-   [ ] Password expiration reminders

## 🔧 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security Notice

This is a demonstration project. While it implements proper encryption techniques, it has not undergone professional security auditing. Use at your own risk for production environments.

---

Made with ❤️ by [Rohit Ghosh]
