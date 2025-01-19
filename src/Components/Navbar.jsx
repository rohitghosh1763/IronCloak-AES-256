const Navbar = () => {
    return (
        <nav className="bg-slate-800 text-white text-l ">
            <div
                className="mycontainer flex justify-between 
        items-center py-2 px-4"
            >
                <div className="logo font-bold text-xl">
                    <span className="text-red-700">&lt;</span> Iron
                    <span className="text-red-700">Cloak</span> /
                    <span className="text-red-700">&gt;</span>
                </div>
                <a href="https://github.com/rohitghosh1763" target="blank">
                    <button className="flex gap-4 border border-black text-black font-bold bg-sky-300 items-center rounded-full px-3 py-1 ">
                        <img
                            src="/icons/github.png"
                            className="w-6"
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
