const Navbar = () => {
    return (
        <nav className="bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-lg">
            <div className="mycontainer flex justify-between items-center py-3 px-6 max-w-7xl mx-auto">
                <div className="logo font-bold text-2xl flex items-center">
                    <span className="text-red-500 animate-pulse">&lt;</span>
                    <span className="text-white mx-1">Iron</span>
                    <span className="text-red-500">Cloak</span>
                    <span className="text-red-500 animate-pulse">/&gt;</span>
                </div>
                <a
                    href="https://github.com/rohitghosh1763"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <button className="flex gap-2 items-center rounded-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95">
                        <img
                            src="/icons/github.png"
                            className="w-5 invert"
                            alt="github"
                        />
                        GitHub
                    </button>
                </a>
            </div>
        </nav>
    );
};

export default Navbar;
