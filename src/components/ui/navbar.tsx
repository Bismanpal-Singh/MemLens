import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation, Link } from "react-router-dom"; // Import useLocation and Link

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get the current route

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) =>
    location.pathname === path ? "text-blue-400 font-bold" : "text-gray-500";

  return (
    <nav className="bg-black bg-opacity-30 backdrop-blur-lg fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <a href="/" className="flex items-center py-4 px-2">
                <img src="/Memlens.png" alt="Logo" className="logo" />
              </a>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`py-4 px-2 font-semibold hover:text-blue-400 transition duration-300 ${isActive(
                "/"
              )}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`py-4 px-2 font-semibold hover:text-blue-400 transition duration-300 ${isActive(
                "/dashboard"
              )}`}
            >
              Dashboard
            </Link>
            <Link
              to="/authors"
              className={`py-4 px-2 font-semibold hover:text-blue-400 transition duration-300 ${isActive(
                "/authors"
              )}`}
            >
              Meet the Team
            </Link>
            <Link
              to="https://blog.resilientdb.com/2024/12/07/MemLens.html"
              className={`py-4 px-2 font-semibold hover:text-blue-400 transition duration-300 ${isActive(
                "/blog"
              )}`}
            >
              Blog
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button
              className="outline-none mobile-menu-button"
              onClick={toggleMenu}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <Link
          to="/"
          className={`block py-2 px-4 text-sm hover:bg-gray-200 ${isActive(
            "/"
          )}`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`block py-2 px-4 text-sm hover:bg-gray-200 ${isActive(
            "/dashboard"
          )}`}
        >
          Dashboard
        </Link>
        <Link
          to="/authors"
          className={`block py-2 px-4 text-sm hover:bg-gray-200 ${isActive(
            "/authors"
          )}`}
        >
          Meet the Team
        </Link>
        <Link
          to="/blog"
          className={`block py-2 px-4 text-sm hover:bg-gray-200 ${isActive(
            "/blog"
          )}`}
        >
          Blog
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
