import { useState, useContext } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { AppContext } from "../AppContext";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GoogleSignInButton = ({ axios, completeAuth, googleLoading, setGoogleLoading }) => {
  const handleGoogleSuccess = async (codeResponse) => {
    setGoogleLoading(true);
    try {
      const { data } = await axios.post("/api/user/google", {
        code: codeResponse.code,
      });

      if (data.success) {
        completeAuth(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google sign-in was cancelled"),
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={googleLoading}
      className="flex items-center justify-center gap-3 w-full py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <GoogleIcon />
      <span className="text-gray-700 font-medium">
        {googleLoading ? "Signing in..." : "Continue with Google"}
      </span>
    </button>
  );
};

const Auth = () => {
  const [state, setState] = useState("login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const { setShowUserLogin, setUser, setCartItems, axios, navigate } = useContext(AppContext);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const completeAuth = (data) => {
    toast.success(data.message);
    if (data.token) {
      localStorage.setItem("userToken", data.token);
      localStorage.setItem("token", data.token);
    }
    setUser(data.user);
    setCartItems(data.user?.cartItems || {});
    setShowUserLogin(false);
    navigate("/");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        completeAuth(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center bg-black/50 text-gray-600"
    >
      <form
        onSubmit={submitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-indigo-500">User </span>
          {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Type here"
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
            placeholder="Type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            required
          />
        </div>

        {state === "register" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("login")}
              className="text-indigo-500 cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?{" "}
            <span
              onClick={() => setState("register")}
              className="text-indigo-500 cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}

        <button
          type="submit"
          className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer"
        >
          {state === "register" ? "Create Account" : "Login"}
        </button>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {googleClientId ? (
          <GoogleSignInButton
            axios={axios}
            completeAuth={completeAuth}
            googleLoading={googleLoading}
            setGoogleLoading={setGoogleLoading}
          />
        ) : (
          <button
            type="button"
            onClick={() => toast.error("Google sign-in is not configured yet")}
            className="flex items-center justify-center gap-3 w-full py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-all cursor-pointer"
          >
            <GoogleIcon />
            <span className="text-gray-700 font-medium">Continue with Google</span>
          </button>
        )}
      </form>
    </div>
  );
};

export default Auth;
