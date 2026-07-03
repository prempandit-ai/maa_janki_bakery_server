import {useContext, useState, useEffect } from "react";
import { dummyOrders } from "./assets/assets";
import {AppContext} from "./AppContext";
import toast from "react-hot-toast";
import BackButton from "./components/BackButton";
import { getImageUrl } from "./utils/imageUrl";

function MyOrders() {
  const [myOrders, setMyOrders] = useState([]);
  const {axios,user, backendUrl}=useContext(AppContext);

  const fetchOrders = async() => {
    try{
          const {data}=await axios.get("/api/order/user");
      console.log("data",data);
       if(data.success){
          setMyOrders(data.orders);   
      }
   else{
           toast.error(data.message);
     
    }
    } 
    catch(error){
        toast.error(error.message);
   }  
  };


  useEffect(() => {
    if(user){
    fetchOrders();
  }
  }, []);

  return (
    <div className="mt-2 pb-12 w-full max-w-4xl mx-auto">
      <BackButton />
      <div className="mt-4">
        <p className="text-xl md:text-2xl font-semibold text-gray-800">My Orders</p>
      </div>

      {myOrders.map((order, index) => (
        <div
          key={index}
          className="my-4 border border-gray-300 rounded-lg mb-6 p-3 md:p-5 w-full max-w-4xl bg-white shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-6 border-b border-gray-200 pb-3 text-xs sm:text-sm text-gray-600 font-medium">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>Order ID: <span className="font-semibold text-gray-800">{order._id}</span></span>
              <span>Payment: <span className="font-semibold text-gray-800">{order.paymentType}</span></span>
            </div>
            {order.address && (
              <div className="text-gray-500">
                Delivery to: <span className="font-semibold text-gray-800">{order.address.street || order.address.address}, {order.address.city}</span>
              </div>
            )}
            <span className="font-semibold text-orange-600 sm:text-gray-800">Total: ₹{order.amount}</span>
          </div>

          {order.items.map((item, itemIndex) => (
            <div
              key={itemIndex}
              className={`relative bg-white text-gray-800 flex flex-col md:flex-row md:items-center justify-between p-2 py-3 md:p-4 md:py-5 w-full ${
                itemIndex !== order.items.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-1 border border-gray-100 rounded-md flex-shrink-0">
                  <img
                    src={getImageUrl(item.product?.images?.[0], backendUrl)}
                    alt={item.product?.name || "Product Deleted"}
                    className="w-12 h-12 md:w-16 md:h-16 object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-semibold text-gray-800 leading-tight">{item.product?.name || "Product Deleted"}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{item.product?.category || "N/A"}</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-between items-center md:items-start text-xs md:text-sm text-gray-600 gap-4 mt-3 md:mt-0 pl-14 md:pl-0">
                <div>
                  <p><span className="font-medium text-gray-500">Qty:</span> {item.quantity || 1}</p>
                  <p><span className="font-medium text-gray-500">Status:</span> <span className="text-indigo-600 font-semibold">{order.status}</span></p>
                </div>
                <div className="text-right md:text-left">
                  <p className="hidden md:block"><span className="font-medium text-gray-500">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="md:hidden text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm md:text-base font-semibold text-gray-800 mt-1">₹{(item.product?.offerPrice || 0) * (item.quantity || 1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default MyOrders;
