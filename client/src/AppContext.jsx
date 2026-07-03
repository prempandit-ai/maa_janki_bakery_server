import { createContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Legacy fallback: attach tokens from localStorage if present (httpOnly cookies are primary)
axios.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("userToken") || localStorage.getItem("token");
    const sellerToken = localStorage.getItem("sellerToken");

    if (config.url && config.url.startsWith("/api/seller")) {
      if (sellerToken) {
        config.headers.token = sellerToken;
        config.headers.Authorization = `Bearer ${sellerToken}`;
      }
    } else if (userToken) {
      config.headers.token = userToken;
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AppContext = createContext(null);

const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({}); // always an object
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const hasHydratedUserCart = useRef(false);
  const lastSyncedCartRef = useRef(null);
  
  const backendUrl = axios.defaults.baseURL;

  // Fetch seller status
  const fetchSeller = async () => {
    setIsSellerLoading(true);
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      setIsSeller(!!data.success);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("sellerToken");
      }
      setIsSeller(false);
    } finally {
      setIsSellerLoading(false);
    }
  };

  const fetchUser = async () => {
    setIsUserLoading(true);
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data.success) {
        setUser(data.user);
        setCartItems(data.user.cartItems || {});
      } else {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        setUser(null);
        setCartItems({});
        return;
      }
      toast.error(error.message);
    } finally {
      setIsUserLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Add to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems || {});
    cartData[itemId] = cartData[itemId] ? cartData[itemId] += 1 : 1;
    setCartItems(cartData);
    toast.success("Added to cart");
  };

  // Update cart item
  const updateCartItem = (itemId, quantity) => {
    if (!products.find((p) => p._id === itemId)) return;
    const cartData = structuredClone(cartItems || {});
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success("Cart updated");
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    if (!cartItems[itemId]) return;
    const cartData = structuredClone(cartItems || {});
    cartData[itemId] -= 1;
    if (cartData[itemId] <= 0) delete cartData[itemId];
    setCartItems(cartData);
    toast.success("Removed from cart");
  };

  // Cart count
  const cartCount = () =>
    Object.values(cartItems || {}).reduce((sum, qty) => sum + qty, 0);

  // Total cart amount
  const totalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems || {}) {
      const product = products.find((p) => p._id === itemId);
      if (!product) continue;
      total += cartItems[itemId] * product.offerPrice;
    }
    return Math.floor(total * 100) / 100;
  };

  // Update cart on backend whenever it changes
  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      hasHydratedUserCart.current = false;
      lastSyncedCartRef.current = null;
      return;
    }

    const cartPayload = JSON.stringify(cartItems || {});

    if (!hasHydratedUserCart.current) {
      hasHydratedUserCart.current = true;
      lastSyncedCartRef.current = cartPayload;
      return;
    }

    if (lastSyncedCartRef.current === cartPayload) {
      return;
    }

    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });
        if (data.success) {
          lastSyncedCartRef.current = cartPayload;
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        // On 401, silently skip — user may have just logged in and the
        // cookie hasn't propagated yet, or the session genuinely expired.
        // Do NOT clear user here to avoid a race condition after Google login.
        if (error?.response?.status === 401) {
          return;
        }
        toast.error(error.message);
      }
    };
    updateCart();
  }, [cartItems, isUserLoading, user]);

  // Initial fetches
  useEffect(() => {
    fetchProducts();
    fetchUser();
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/seller")) {
      fetchSeller();
    } else {
      setIsSellerLoading(false);
    }
  }, [location.pathname]);

  // Navigate on search - use ref to track previous value and prevent initial navigation
  const prevSearchQueryRef = useRef(searchQuery);
  const isInitialMount = useRef(true);
  
  // Debounced search for suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const { data } = await axios.get(`/api/products/search?q=${searchQuery}`);
          if (data.success) {
            setSearchSuggestions(data.products.slice(0, 5)); // Limit to 5 for autocomplete
          }
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchSuggestions([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    // Skip navigation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevSearchQueryRef.current = searchQuery;
      return;
    }

    if (typeof searchQuery !== "string") {
      prevSearchQueryRef.current = searchQuery;
      return;
    }

    const trimmedQuery = searchQuery.trim();
    const prevQuery = prevSearchQueryRef.current;
    
    // Only navigate if search query actually changed
    if (prevQuery !== searchQuery) {
      if (trimmedQuery.length > 0) {
        // User typed something - navigate to products
        navigate("/products");
      } else if (prevQuery && prevQuery.trim().length > 0 && searchQuery === "") {
        // User cleared the search (was non-empty, now empty) - navigate to home
        const currentPath = window.location.pathname;
        if (currentPath === "/products") {
          navigate("/");
        }
      }
      // Update ref for next comparison
      prevSearchQueryRef.current = searchQuery;
    }
  }, [searchQuery, navigate]);

  const value = {
    navigate,
    user,
    setUser,
    isUserLoading,
    isSeller,
    setIsSeller,
    isSellerLoading,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartCount,
    totalCartAmount,
    cartItems,
    searchQuery,
    setSearchQuery,
    searchSuggestions,
    setSearchSuggestions,
    axios,
    fetchProducts,
    fetchSeller,
    setCartItems,
    backendUrl,
    trackInteraction: async (productId, action) => {
      try {
        await axios.post("/api/recommend/track", { productId, action });
      } catch (error) {
        console.error("Failed to track interaction", error);
      }
    }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
