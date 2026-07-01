import { useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppContext } from "./AppContext";
import profile_icon from "./profile_icon.png";
import cart_icon from "./cart_icon.svg";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();

  const {
    user,
    setUser,
    navigate,
    setShowUserLogin,
    cartCount,
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    setSearchSuggestions,
    axios,
    backendUrl,
  } = useContext(AppContext);

  // Close mobile search when route changes
  useEffect(() => {
    setShowMobileSearch(false);
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!showProfileMenu) return;

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest("button[aria-label='Menu']")
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close mobile search on outside click
  useEffect(() => {
    if (!showMobileSearch) return;

    const handleClickOutside = (e) => {
      if (
        !e.target.closest("button[aria-label='Search']") &&
        !e.target.closest("input[placeholder='Search products']")
      ) {
        setShowMobileSearch(false);
        setSearchSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileSearch]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/user/logout");
    } catch (err) {
      console.error("User logout error:", err);
    }
    localStorage.removeItem("userToken");
    localStorage.removeItem("token");
    setUser(null);
    setShowProfileMenu(false);
    setOpen(false);
    navigate("/");
  };

  const cartCountValue = cartCount ? cartCount() : 0;

  // Get profile image URL with proper backend URL construction
  const getProfileImageUrl = () => {
    if (!user?.avatar) return profile_icon;
    
    // If avatar is already a full URL (http/https), return it
    if (user.avatar.startsWith("http://") || user.avatar.startsWith("https://")) {
      return user.avatar;
    }
    
    // If avatar is a blob URL (preview from file input), return it
    if (user.avatar.startsWith("blob:")) {
      return user.avatar;
    }
    
    // Construct the full URL from backend
    // Avatar from server is typically like "/images/filename.jpg"
    const avatarPath = user.avatar.startsWith("/") ? user.avatar : `/${user.avatar}`;
    return `${backendUrl}${avatarPath}`;
  };

  const profileImageUrl = user ? getProfileImageUrl() : profile_icon;

  return (
    <nav className="flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 py-3 border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
      {/* Logo */}
      <Link to="/" className="min-w-0" onClick={() => setOpen(false)}>
        <h1 className="text-xl md:text-2xl font-bold text-orange-600 leading-snug truncate max-w-[240px] md:max-w-none">
          Maa Janki Bakery & Farsan Store
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center gap-8">
        <Link to="/" className="hover:text-orange-600 transition-colors">
          Home
        </Link>
        <Link to="/products" className="hover:text-orange-600 transition-colors">
          All Products
        </Link>

        {/* Search Box */}
        <div className="hidden lg:flex flex-col relative">
          <div className="flex items-center gap-2 border border-gray-300 px-3 rounded-full hover:border-orange-500 transition-colors">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 w-64 bg-transparent outline-none placeholder-gray-500"
            />
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.836 10.615 15 14.695"
                stroke="#7A7B7D"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                clipRule="evenodd"
                d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
                stroke="#7A7B7D"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Search Suggestions Dropdown */}
          {searchSuggestions.length > 0 && searchQuery && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {searchSuggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/products/${product.category?.toLowerCase()}/${product._id}`);
                    setSearchSuggestions([]);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex flex-col border-b last:border-0 border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <div
          onClick={() => {
            navigate("/cart");
            setOpen(false);
          }}
          className="relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src={cart_icon} alt="Cart" className="w-6 h-6" />
          {cartCountValue > 0 && (
            <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {cartCountValue}
            </span>
          )}
        </div>

        {/* User Profile */}
        {user ? (
          <div ref={profileRef} className="relative">
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 hover:border-orange-500 transition-all shadow-sm"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onError={(e) => {
                // Fallback to default icon if image fails to load
                e.target.src = profile_icon;
              }}
            />
            {showProfileMenu && (
              <ul className="absolute top-12 right-0 bg-white shadow-md rounded-md border border-gray-200 py-2 w-40 z-40 text-sm">
                <li
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Profile
                </li>
                <li
                  onClick={() => {
                    navigate("/my-orders");
                    setShowProfileMenu(false);
                  }}
                  className="p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  My Orders
                </li>
                <li
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowUserLogin(true)}
            className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white rounded-full"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Icons */}
      <div className="flex items-center gap-3 sm:hidden">
        {user && (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-9 h-9 rounded-full border-2 border-gray-200 object-cover cursor-pointer hover:opacity-80 hover:border-orange-500 transition-all shadow-sm"
            onClick={() => {
              navigate("/profile");
              setOpen(false);
            }}
            onError={(e) => {
              // Fallback to default icon if image fails to load
              e.target.src = profile_icon;
            }}
          />
        )}

        <button
          onClick={() => {
            setShowMobileSearch(!showMobileSearch);
            setOpen(false);
          }}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.836 10.615 15 14.695"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              clipRule="evenodd"
              d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783"
              stroke="#7A7B7D"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          onClick={() => {
            navigate("/cart");
            setOpen(false);
          }}
          className="relative cursor-pointer"
        >
          <img src={cart_icon} alt="Cart" className="w-6 h-6" />
          {cartCountValue > 0 && (
            <span className="absolute -top-2 -right-3 text-xs text-white bg-indigo-500 w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {cartCountValue}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setOpen(!open);
            setShowMobileSearch(false);
          }}
          aria-label="Menu"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg
            width="21"
            height="15"
            viewBox="0 0 21 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="21" height="1.5" rx=".75" fill="#426287" />
            <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#426287" />
            <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#426287" />
          </svg>
        </button>
      </div>

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 px-4 py-3 sm:hidden shadow-md z-20">
          <div className="flex items-center gap-2 border border-gray-300 px-3 rounded-full">
            <input
              type="text"
              placeholder="Search products"
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 bg-transparent outline-none placeholder-gray-500"
              autoFocus
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              aria-label="Close search"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          
          {/* Mobile Suggestions */}
          {searchSuggestions.length > 0 && searchQuery && (
            <div className="mt-2 bg-white rounded-lg overflow-hidden">
              {searchSuggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => {
                    navigate(`/products/${product.category?.toLowerCase()}/${product._id}`);
                    setSearchSuggestions([]);
                    setSearchQuery("");
                    setShowMobileSearch(false);
                  }}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex flex-col border-b last:border-0 border-gray-100"
                >
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`${
          open ? "flex" : "hidden"
        } absolute top-full left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-4 px-5 text-sm sm:hidden border-b border-gray-200 z-20`}
      >
        <Link
          onClick={() => setOpen(false)}
          to="/"
          className="hover:text-orange-600 transition-colors w-full text-left"
        >
          Home
        </Link>
        <Link
          onClick={() => setOpen(false)}
          to="/products"
          className="hover:text-orange-600 transition-colors w-full text-left"
        >
          All Products
        </Link>

        {user ? (
          <>
            <button
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
              className="text-left hover:text-orange-600 transition-colors w-full"
            >
              Profile
            </button>
            <button
              onClick={() => {
                navigate("/my-orders");
                setOpen(false);
              }}
              className="text-left hover:text-orange-600 transition-colors w-full"
            >
              My Orders
            </button>
            <button
              onClick={handleLogout}
              className="text-left hover:text-orange-600 transition-colors w-full"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setOpen(false);
              setShowUserLogin(true);
            }}
            className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white rounded-full"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
