import React from "react";

const Navbar = ({ isUnlocked, lockVault }) => {
    // Add props if you want Navbar to handle lock
    return (
        <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
            <div className="mycontainer flex justify-between items-center py-3.5 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="logo font-bold text-2xl flex items-center">
                    <span className="text-red-500 animate-pulse">&lt;</span>
                    <span className="text-white mx-1">Iron</span>
                    <span className="text-red-500">Cloak</span>
                    <span className="text-red-500 animate-pulse">/&gt;</span>
                </div>
                <div className="flex items-center space-x-4">
                    <a
                        href="https://github.com/rohitghosh1763"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <button className="flex gap-2 items-center rounded-full px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-semibold hover:from-sky-600 hover:to-cyan-500 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95">
                            <img
                                src="/icons/github.png"
                                className="w-5 h-5 invert"
                                alt="GitHub"
                            />
                            <span>GitHub</span>
                        </button>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
