import  {Routes,Route,useLocation} from "react-router-dom";
import Home from "./Home";
import Products from "./Products";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart";
import NavBar from "./NavBar";
import {useContext } from "react";
import {AppContext} from "./AppContext";
import MyOrders   from "./MyOrders";
import Auth from "./models/Auth";
import ProductCategory from "./pages/ProductCategory";
import {Toaster} from "react-hot-toast";
import AppContextProvider from "./AppContext";
import AddAddress from "./pages/AddAddress";
import Footer from "./components/Footer";
import SellerLogin from "./seller/SellerLogin";
import SellerLayout from "./seller/SellerLayout";
import UserProfile from "./pages/UserProfile";
import Chatbot from "./components/chatbot";
import ScrollToTop from "./components/ScrollToTop";

import AddProduct from "./seller/AddProduct";
import EditProduct from "./seller/EditProduct";
import ProductList from "./seller/ProductList";
import Orders from "./seller/Orders";
import Dashboard from "./seller/Dashboard";
import BakeSmartDashboard from "./pages/BakeSmartDashboard";



const App = () => {
    const {isSeller, isSellerLoading, showUserLogin, user, navigate}=useContext(AppContext);
   const isSellerPath=useLocation().pathname.includes("seller");
  return (
    <div className="text-default min-h-screen">
        {isSellerPath ? null : <NavBar/> }
        {showUserLogin ? <Auth/> : null }
    <Toaster/>

      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        <ScrollToTop />
        <Routes>
         <Route path="/" element={<Home/>}/>
         <Route path="/products" element={<Products/>}/>
         <Route path="/products/:category/:id" element={<ProductDetails/>}/>
         <Route path="/products/:category" element={<ProductCategory/>}/>

         <Route path="/cart" element={<Cart/>}/>
         <Route path="/my-orders" element={<MyOrders/>}/>
         <Route path="/add-address" element={<AddAddress/>}/>
         <Route path="/profile" element={<UserProfile/>}/>
         <Route path="/admin-dashboard" element={<BakeSmartDashboard />} />

    <Route path="/seller" 
        element={
          isSellerLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg">Loading...</div>
            </div>
          ) : isSeller ? (
            <SellerLayout/>
          ) : (
            <SellerLogin/>
          )
        }
         >   
               
          <Route index 
           element={isSeller? <Dashboard />:null } 
           />

          <Route path="add-product" 
           element={isSeller? <AddProduct />:null } 
           />

           <Route 
              path="product-list"  
              element={isSeller? <ProductList />:null }
            />
          <Route 
              path="edit-product/:id"  
              element={isSeller? <EditProduct />:null }
            />
          <Route 
          path="orders" 
        element={isSeller ? <Orders/>:null}
                              
          />
      </Route> 

 
        </Routes>
      </div>
       {isSellerPath? null :<Footer/>}
       <Chatbot />
   </div>
  );
};

export default App;
