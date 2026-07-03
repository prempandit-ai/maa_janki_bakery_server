import {useState,useEffect,useContext} from "react";
import {dummyOrders,assets} from "../assets/assets";
import {AppContext} from "../AppContext";
import { getImageUrl } from "../utils/imageUrl";
import toast from "react-hot-toast";

const Orders = () => {
    const [orders, setOrders] = useState(null); // Initialize with null for loading check
    const { axios, backendUrl } = useContext(AppContext);

    const getCustomerName = (order) => {
        const address = order.address || {};
        if (address.firstName || address.lastName) {
            return `${address.firstName || ""} ${address.lastName || ""}`.trim();
        }
        return order.userId?.name || "Unknown customer";
    };

    const getAddressLine = (address = {}) => {
        return [
            address.street || address.address,
            address.city,
            address.state,
            address.country,
            address.zipCode || address.zipcode || address.pincode,
        ]
            .filter(Boolean)
            .join(", ");
    };

    const getPhoneNumber = (order) => {
        return order.address?.phone || order.address?.phoneNumber || order.userId?.phoneNumber || "";
    };

    const isAwaitingApproval = (status) => {
        return status === "Pending Approval" || status === "Order Placed";
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get("/api/order/seller", { withCredentials: true });
            console.log("Orders API response:", data);
            if (data.success) {
                setOrders(data.orders);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            // toast.error(error.message); // toast might not be imported, use console
            setOrders([]);
        }
    };

    const statusHandler = async (orderId, status) => {
        try {
            const { data } = await axios.post("/api/order/status", { orderId, status }, { withCredentials: true });
            if (data.success) {
                await fetchOrders();
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const approvalHandler = async (orderId, decision) => {
        try {
            const { data } = await axios.post(
                "/api/order/approval",
                { orderId, decision },
                { withCredentials: true }
            );
            if (data.success) {
                toast.success(data.message);
                await fetchOrders();
            } else {
                toast.error(data.message || "Unable to update order");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (orders === null) {
        return <div className="p-10 text-center">Loading orders...</div>;
    }

    return (
        <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders?.map((order, index) => {
                    console.log("Rendering order:", order);
                    return (
                        <div key={index} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center gap-4 p-4 md:p-5 max-w-4xl rounded-lg border border-gray-200 text-gray-800 bg-white shadow-sm">
                            {/* Product Info */}
                            <div className="flex gap-3 items-start">
                                <img
                                    className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-md opacity-80 flex-shrink-0 border border-gray-200"
                                    src={getImageUrl(order.items?.[0]?.product?.images?.[0], backendUrl)}
                                    alt="Product"
                                />
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex flex-col justify-center">
                                            <p className="font-semibold text-sm md:text-base truncate">
                                                {item.product?.name || "Unknown Product"} 
                                                <span className={`text-indigo-500 text-xs ${item.quantity < 2 ? "hidden" : ""}`}> x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Customer / Address */}
                            <div className="text-xs md:text-sm border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                                <p className='font-semibold mb-0.5 text-gray-700'>{getCustomerName(order)}</p>
                                <p className="text-gray-500 leading-snug">
                                    {getAddressLine(order.address) || "Address not available"}
                                </p>
                                <p className="text-gray-500 leading-snug mt-1">
                                    Phone: <span className="font-medium text-gray-700">{getPhoneNumber(order) || "Not available"}</span>
                                </p>
                            </div>

                            {/* Amount */}
                            <p className="font-bold text-base md:text-lg text-gray-800 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">₹{order.amount}</p>

                            {/* Status / Payment */}
                            <div className="flex flex-col text-xs md:text-sm border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                                <p className="text-gray-500">Method: <span className="font-medium text-gray-700">{order.paymentType}</span></p>
                                <p className="text-gray-500 mt-0.5">Payment: <span className={`font-semibold ${order.isPaid ? "text-green-600" : "text-orange-500"}`}>{order.isPaid ? "Paid" : "Pending"}</span></p>
                                <p className="text-gray-500 mt-0.5">Status: <span className="font-semibold text-gray-700">{isAwaitingApproval(order.status) ? "Pending Approval" : order.status}</span></p>
                                {isAwaitingApproval(order.status) ? (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => approvalHandler(order._id, "accepted")}
                                            className="px-3 py-1.5 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => approvalHandler(order._id, "rejected")}
                                            className="px-3 py-1.5 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : order.status === "Order Rejected" ? (
                                    <p className="mt-2 px-3 py-1.5 rounded-md bg-red-50 text-red-600 font-semibold w-fit">
                                        Order Rejected
                                    </p>
                                ) : (
                                    <select
                                        onChange={(e) => statusHandler(order._id, e.target.value)}
                                        value={order.status}
                                        className="p-1.5 border border-gray-200 rounded-lg mt-2 text-xs bg-white outline-none"
                                    >
                                        <option value="Order Confirmed">Order Confirmed</option>
                                        <option value="Packing">Packing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for delivery">Out for delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

//   <p>Date: {new Date().toLocaleString().orderDate}</p>


export default Orders;
