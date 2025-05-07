import React from "react";
import Navbar from "./Components/Navbar.jsx";
import Manager from "./Components/Manager.jsx";
import Footer from "./Components/Footer.jsx";
const App = () => {
    return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow"> {/* This makes Manager content take available space */}
            <Manager />
          </main>
          <Footer />
        </div>
      );
};

export default App;
