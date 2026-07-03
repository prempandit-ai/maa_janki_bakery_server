import  {useState, useContext, useEffect } from "react";
import  {assets}  from "../assets/assets.jsx";
import { AppContext } from "../AppContext";
import toast from "react-hot-toast";

const AddAddress = () => {
  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
   
  const [address, setAddress] =useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });
  const {
    axios,
    user,
    setUser,
    setCartItems,
    isUserLoading,
    navigate,
    setShowUserLogin,
  } = useContext(AppContext);
  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
     try{
        e.preventDefault();
        if (!user) {
          setShowUserLogin(true);
          return toast.error("Please login to add an address");
        }

        const { data: authData } = await axios.get("/api/user/is-auth");
        if (!authData.success) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("token");
          setUser(null);
          setCartItems({});
          setShowUserLogin(true);
          return toast.error("Your session expired. Please login again");
        }

        const {data}=await axios.post("/api/address/add",{address});     
    if(data.success){
         toast.success(data.message);
         navigate("/cart");
    } 
 
   else{
         toast.error(data.message || "Unable to save address");

 }

   }
   catch(error){
       if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        setUser(null);
        setCartItems({});
        setShowUserLogin(true);
       }
       toast.error(error.response?.data?.message || error.message);
  }
  
 };

  useEffect(()=>{
     if(!isUserLoading && user===null){
        setShowUserLogin(true);
        navigate("/cart");   
    }
  },[isUserLoading,user,navigate,setShowUserLogin]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-600">
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto mt-6 mb-12 max-w-6xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Checkout
          </p>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Add delivery address
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="w-fit rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-indigo-200 hover:text-indigo-600"
        >
          Back to cart
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Address details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              We will use this address for delivery and order updates.
            </p>
          </div>

        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={address.firstName}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={address.lastName}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              value={address.email}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Street</label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Zip Code</label>
            <input
              type="number"
              name="zipCode"
              value={address.zipCode}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <input
              type="text"
              name="country"
              value={address.country}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Phone</label>
            <input
              type="number"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              className={fieldClass}
              required
            />
          </div>

          <div className="mt-2 md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/15 transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>

        <aside className="hidden rounded-lg border border-indigo-100 bg-indigo-50/60 p-6 lg:flex lg:flex-col lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Fast checkout starts here
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Save your delivery details once and pick them quickly when placing future orders.
            </p>
          </div>
          <img
            src={assets.add_address_image}
            alt="Address Illustration"
            className="mx-auto mt-8 w-full max-w-xs"
          />
          <div className="mt-8 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm">
            <p className="font-semibold text-gray-900">Delivery tip</p>
            <p className="mt-1">
              Add a clear street address and reachable phone number to avoid delays.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddAddress;
