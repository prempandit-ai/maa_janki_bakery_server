import { useState, useEffect, useContext } from "react";
import { AppContext } from "../AppContext";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { assets } from "../assets/assets";
import { getImageUrl } from "../utils/imageUrl";

const Dashboard = () => {
    const { axios, backendUrl, navigate } = useContext(AppContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data } = await axios.get("/api/seller/dashboard", { withCredentials: true });
            if (data.success) {
                setData(data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Analytics...</div>;
    if (!data || !data.stats) return <div className="p-10 text-center text-red-500">Failed to load data.</div>;

    const COLORS = ["#6366f1", "#f97316", "#ef4444", "#10b981", "#8b5cf6"];

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center gap-2">
                <h1 className="text-lg md:text-2xl font-bold text-gray-800">Seller Dashboard</h1>
                <div className="text-xs md:text-sm text-gray-500 whitespace-nowrap">Real-time Analytics</div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[
                    { label: "Total Sales", value: `₹${data.stats.totalSales.toLocaleString()}`, icon: "💰", color: "bg-green-100 text-green-600" },
                    { label: "Total Orders", value: data.stats.totalOrders, icon: "📦", color: "bg-blue-100 text-blue-600" },
                    { label: "Total Products", value: data.stats.totalProducts, icon: "🏷️", color: "bg-purple-100 text-purple-600" },
                    { label: "Low Stock", value: data.stats.lowStockCount, icon: "⚠️", color: "bg-red-100 text-red-600" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 md:gap-4">
                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center text-lg md:text-2xl flex-shrink-0 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] md:text-sm text-gray-500 font-medium truncate">{stat.label}</p>
                            <p className="text-base md:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Over Time */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 text-gray-700">Sales Trend (Last 30 Days)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesOverTime}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 text-gray-700">Sales by Category</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categorySales}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categorySales.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Selling Products */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 text-gray-700">Top Selling Products</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="quantity" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Inventory Status */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 text-gray-700">Inventory Overview</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.inventoryStats}
                                    innerRadius={0}
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#fcd34d" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-700">Recent Orders</h2>
                        <button 
                            onClick={() => navigate("/seller/orders")}
                            className="text-indigo-500 text-sm font-medium hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-50">
                                    <th className="pb-3 font-medium">Product</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.recentOrders.map((order, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="py-4 flex items-center gap-3">
                                            <img 
                                                src={getImageUrl(order.items[0]?.product?.images?.[0], backendUrl)}
                                                className="w-8 h-8 rounded-md object-cover border" 
                                                alt=""
                                            />
                                            <span className="font-medium text-gray-700 truncate max-w-[150px]">
                                                {order.items[0]?.product?.name || "Product"}
                                                {order.items.length > 1 && ` +${order.items.length - 1}`}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-600">
                                            {order.address?.firstName} {order.address?.lastName}
                                        </td>
                                        <td className="py-4 font-semibold text-gray-800">
                                            ₹{order.amount}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                order.isPaid ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                            }`}>
                                                {order.isPaid ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Warning List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6 text-gray-700 flex items-center gap-2">
                        <span className="text-red-500 text-xl">⚠️</span> Low Stock Products
                    </h2>
                    <div className="space-y-4">
                        {data.lowStockProducts.length > 0 ? (
                            data.lowStockProducts.map((product, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 border border-red-100/50">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={getImageUrl(product.images[0], backendUrl)}
                                            className="w-10 h-10 rounded-md object-cover border border-red-100" 
                                            alt=""
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{product.name}</p>
                                            <p className="text-xs text-red-500 font-medium">{product.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium">Stock Left</p>
                                        <p className="text-sm font-bold text-red-600">{product.stock}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 text-sm italic">All items are well stocked! ✨</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-6 py-2 px-4 bg-indigo-50 color-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                        Restock Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
