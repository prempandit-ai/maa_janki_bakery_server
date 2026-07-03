import { useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { dummyAddress } from "./assets/assets";
import toast from "react-hot-toast";
import RecommendationSection from "./components/RecommendationSection";
import { getImageUrl } from "./utils/imageUrl";


function Cart() {
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    removeFromCart,
    updateCartItem,
    axios,user,setCartItems, backendUrl
  } = useContext(AppContext);

  const [cartArray, setCartArray] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [address,setAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentOption, setPaymentOption] = useState("COD");
  const [cartRecommendations, setCartRecommendations] = useState([]);

  // Fetch cart recommendations
  useEffect(() => {
    const fetchCartRecs = async () => {
      const pIds = Object.keys(cartItems);
      if (pIds.length > 0) {
        try {
          const { data } = await axios.post("/api/recommend/cart", { productIds: pIds });
          if (data.success) {
            setCartRecommendations(data.products);
          }
        } catch (error) {
          console.error("Failed to fetch cart recommendations", error);
        }
      } else {
        setCartRecommendations([]);
      }
    };
    fetchCartRecs();
  }, [cartItems]);

  // Populate cart array from products and cartItems
  const getCart = () => {
    const tempArray = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) {
        tempArray.push({ ...product, quantity: cartItems[key] });
      }
    }
    setCartArray(tempArray);
  };
  
const getAddress = async () => {
  try {
    const { data } = await axios.get("/api/address/get");
    if (data.success) {
      setAddress(data.addresses);
      if (data.addresses.length > 0) {
        setSelectedAddress(data.addresses[0]);
      } else if (user && user.address) {
        setSelectedAddress({
          street: user.address,
          city: user.city,
          state: user.state,
          country: "India",
          zipCode: user.pincode,
          phone: user.phoneNumber,
          _id: "profile_address"
        });
      } else {
        toast("No addresses found, please add one.");
      }
    } else {
      toast.error(data.message || "Failed to fetch addresses");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

   useEffect(()=>{
      if(user){
       getAddress();
     }
  },[user]);



  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

const placeOrder = async () => {
  try {
    if (cartArray.length === 0) {
      return toast.error("Your cart is empty");
    }

    if (!selectedAddress) {
      return toast.error("Please select an address");
    }

    if (paymentOption === "COD") {
      const { data } = await axios.post("/api/order/cod", {
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id === "profile_address" ? selectedAddress : selectedAddress._id,
      });

      if (data.success) {
        toast.success(data.message || "Order placed successfully!");
        setCartItems({});
        navigate("/my-orders");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } else if (paymentOption === "Online") {
      toast("Redirecting to online payment...");
      // Here you can trigger Razorpay/Stripe integration
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  if (!products.length || !cartItems) return null;

  return (
    <div className="py-6 md:py-12 max-w-6xl w-full px-4 md:px-6 mx-auto">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        {/* Cart Items Section */}
        <div className="flex-1 w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Shopping Cart{" "}
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full font-semibold">{cartCount()} items</span>
          </h1>

          <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-xs md:text-sm font-semibold uppercase tracking-wider border-b border-gray-200 pb-3">
            <p className="text-left">Product Details</p>
            <p className="text-center">Subtotal</p>
            <p className="text-center">Action</p>
          </div>

          <div className="divide-y divide-gray-100">
            {cartArray.map((product, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr] text-gray-600 items-center text-xs md:text-base pt-4 pb-4"
              >
                <div className="flex items-center gap-2.5 md:gap-4">
                  <div
                    onClick={() => {
                      navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                      scrollTo(0, 0);
                    }}
                    className="cursor-pointer w-16 h-16 md:w-24 md:h-24 flex-shrink-0 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                  >
                    <img
                      className="max-w-full h-full object-cover"
                       src={getImageUrl(product.images?.[0], backendUrl)}
                      alt={product.name}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-xs md:text-base truncate hover:text-indigo-500 cursor-pointer" onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}>
                      {product.name}
                    </p>
                    <div className="font-normal text-gray-400 mt-1 space-y-0.5 text-[10px] md:text-xs">
                      <p><span className="text-gray-500">Weight:</span> {product.weight || "N/A"}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-gray-500">Qty:</span>
                        <select
                          onChange={(e) =>
                            updateCartItem(product._id, Number(e.target.value))
                          }
                          value={cartItems?.[product._id] || 0}
                          className="outline-none border border-gray-200 rounded px-1 py-0.5 bg-white font-medium text-gray-700"
                        >
                          {Array(
                            cartItems?.[product._id] > 9 ? cartItems[product._id] : 9
                          )
                            .fill("")
                            .map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-center font-semibold text-xs md:text-base text-gray-800">₹{product.offerPrice * product.quantity}</p>

                <div className="flex items-center justify-center">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="cursor-pointer p-1.5 rounded-full hover:bg-red-500/10 transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                        stroke="#FF532E"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              navigate("/products");
              scrollTo(0, 0);
            }}
            className="group cursor-pointer flex items-center mt-6 gap-2 text-indigo-600 font-semibold text-xs md:text-sm hover:text-indigo-700 transition-colors"
          >
            <svg
              width="15"
              height="11"
              viewBox="0 0 15 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1"
                stroke="#615fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* Order Summary Section */}
        <div className="w-full md:max-w-[360px] bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Order Summary</h2>
          <h2 className="text-lg md:text-s font-bold text-gray-800 font-color:red">Delivery upto price 150 above</h2>

          <hr className="border-gray-100 my-4" />

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Address</p>
            <div className="relative flex justify-between items-start mt-2">
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed pr-2">
                {selectedAddress
                  ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}${selectedAddress.country ? `, ${selectedAddress.country}` : ""}`
                  : "No Address Found"}
              </p>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-indigo-600 hover:underline cursor-pointer text-xs md:text-sm font-semibold flex-shrink-0"
              >
                Change
              </button>
              {showAddress && (
                <div className="absolute top-12 py-1 bg-white border border-gray-200 text-xs w-full z-20 shadow-xl rounded-lg max-h-60 overflow-y-auto">
                  {address.map((addr, index) => (
                    <p
                      key={index}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setShowAddress(false);
                      }}
                      className="text-gray-600 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                    >
                      {addr.street}, {addr.city}, {addr.state}, {addr.country}
                    </p>
                  ))}
                  {user && user.address && (
                    <p
                      onClick={() => {
                        setSelectedAddress({
                          street: user.address,
                          city: user.city,
                          state: user.state,
                          country: "India",
                          zipCode: user.pincode,
                          phone: user.phoneNumber,
                          _id: "profile_address"
                        });
                        setShowAddress(false);
                      }}
                      className="text-gray-600 p-2 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                     <span className="font-semibold text-indigo-600">[Saved]</span> {user.address}, {user.city}, {user.state}
                    </p>
                  )}
                  <p
                    onClick={() => navigate("/add-address")}
                    className="text-indigo-600 font-semibold text-center cursor-pointer p-2 hover:bg-indigo-50 border-t border-gray-100"
                  >
                    Add address
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-5">Payment Method</p>
            <select
              onChange={(e) => setPaymentOption(e.target.value)}
               className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 mt-2 outline-none text-xs md:text-sm text-gray-700 font-medium cursor-pointer"
            >
              <option value="COD">Cash On Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          <hr className="border-gray-100" />

          <div className="text-gray-500 mt-4 space-y-2 text-xs md:text-sm">
            <p className="flex justify-between">
              <span>Price</span>
              <span className="font-semibold text-gray-700">₹{totalCartAmount()}</span>
            </p>
            <p className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-green-600 font-semibold">Free</span>
            </p>
            <p className="flex justify-between">
              <span>Tax (5%)</span>
              <span className="font-semibold text-gray-700">₹{(totalCartAmount() * 5) / 100}</span>
            </p>
            <hr className="border-gray-50 my-2" />
            <p className="flex justify-between text-base md:text-lg font-bold text-gray-800 pt-1">
              <span>Total Amount:</span>
              <span className="text-indigo-600">₹{totalCartAmount() + (totalCartAmount() * 5) / 100}</span>
            </p>
          </div>

          <button
            onClick={placeOrder}
            className="w-full py-3 mt-6 cursor-pointer bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 text-sm md:text-base"
          >
            {paymentOption === "COD" ? "Place Order" : "Pay Now"}
          </button>
        </div>
      </div>
      <RecommendationSection title="You May Also Like" products={cartRecommendations} />
    </div>
  );
}

export default Cart;
