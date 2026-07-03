import { useContext } from "react";
import { AppContext } from "../AppContext";
import { assets } from "../assets/assets";
import { NavLink, useLocation, Navigate, Outlet } from "react-router-dom";

import AddProduct from "./AddProduct";
import ProductList from "./ProductList";
import Orders from "./Orders";

const SellerLayout = () => {
  const { isSeller, setIsSeller, navigate, axios } = useContext(AppContext);
  const location = useLocation();

  const sidebarLinks = [
    { name: "Dashboard", path: "/seller", icon: assets.order_icon }, // Using order_icon as placeholder
    { name: "Add Product", path: "/seller/add-product", icon: assets.add_icon },
    { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
  ];


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
        {sidebarLinks.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            end={item.path === "/seller"}
            className={({ isActive }) =>
              `flex items-center py-3 px-4 gap-3 ${
                isActive
                  ? "border-r-4 md:border-r-[6px] bg-indigo-300 border-indigo-500 text-indigo-500"
                  : "hover:bg-gray-100/90 border-white"
              }`
            }
          >
            <img src={item.icon} alt="" className="w-7 h-7" />
            <p className="md:block hidden text-center">{item.name}</p>
          </NavLink>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-3 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
          <h1 className="text-base md:text-2xl text-orange-600 font-semibold truncate">
            <span className="hidden sm:inline">Maa Janki Admin Page</span>
            <span className="sm:hidden">MJ Admin</span>
          </h1>
          <div className="flex items-center gap-2 md:gap-5 text-gray-500">
            <p className="hidden md:block text-sm">Hi! Admin</p>
            <button
              onClick={async () => {
                try {
                  await axios.post("/api/seller/logout");
                } catch (err) {
                  console.error("Seller logout error:", err);
                }
                localStorage.removeItem("sellerToken");
                setIsSeller(false);
                navigate("/");
              }}
              className="border rounded-full text-xs md:text-sm px-3 md:px-4 py-1 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Render the selected page */}
        <div className="flex-1 h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SellerLayout;
