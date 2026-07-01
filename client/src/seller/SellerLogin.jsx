import { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import toast from "react-hot-toast";


const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios, isSellerLoading, fetchSeller } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Don't show login form while checking authentication
  if (isSellerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If already authenticated, don't show login form
  if (isSeller) {
    return null;
  }

  const submitHandler = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.post("/api/seller/login", {
        email: email.trim(),
        password,
      });
      if (data.success) {
        if (data.token) {
          localStorage.setItem("sellerToken", data.token);
        }
        setIsSeller(true);
        await fetchSeller();
        navigate("/seller");
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center bg-black/50 text-gray-600">
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submitHandler}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-indigo-500">Seller </span>
          Login
        </p>

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="enter email"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="enter password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            required
          />
        </div>

        <button className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer">
          Login
        </button>
      </form>
    </div>
  );
};

export default SellerLogin;
