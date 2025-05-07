// src/components/Footer.jsx
import React from "react";

const Footer = () => {
    return (
        <footer className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-slate-800 py-4 text-sm text-slate-400 border-t border-slate-700">
            <span>Made with</span>
            <img 
                src="/icons/heart.png" // Ensure this path is correct from your public folder
                className="w-5 h-5" // Adjusted size for better balance
                alt="Heart icon" 
            />
            <span>by Rohit Ghosh</span> {/* Added full name for clarity, optional */}
        </footer>
    );
};

export default Footer;