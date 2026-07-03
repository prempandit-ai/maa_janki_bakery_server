import { useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";

const UserProfile = () => {
  const { user, setUser, axios, setShowUserLogin, fetchUser, backendUrl } =
    useContext(AppContext);
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const normalizeAvatarUrl = (avatarValue) => {
    if (!avatarValue) return "";
    if (avatarValue.startsWith("blob:")) return avatarValue;
    if (avatarValue.startsWith("http://") || avatarValue.startsWith("https://"))
      return avatarValue;

    const avatarPath = avatarValue.startsWith("/")
      ? avatarValue
      : `/${avatarValue}`;
    return `${backendUrl}${avatarPath}`;
  };

  useEffect(() => {
    setPreview(normalizeAvatarUrl(user?.avatar || ""));
  }, [user]);

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview]
  );

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2MB
    if (f.size > maxSizeBytes) {
      toast.error("Image must be under 2MB");
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose an image");
    if (isUploading) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await axios.post("/api/user/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        toast.success("Profile photo updated");
        const nextUser = { ...(user || {}), ...data.user };
        setUser(nextUser);
        setFile(null);
        setPreview(normalizeAvatarUrl(data.user.avatar));
        // Refresh user from backend to stay in sync (silently)
        fetchUser?.();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      const { data } = await axios.delete("/api/user/avatar");
      if (data.success) {
        toast.success("Profile photo removed");
        const nextUser = { ...(user || {}), ...data.user };
        setUser(nextUser);
        setFile(null);
        setPreview("");
        fetchUser?.();
      } else {
        toast.error(data.message || "Remove failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await axios.post("/api/user/update-profile", {
        name: user.name,
        phoneNumber: user.phoneNumber,
      });
      if (data.success) {
        toast.success("Profile updated successfully");
        setUser({ ...user, ...data.user });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  if (!user) {
    return (
      <div className="mt-12 px-4">
        <p className="text-lg mb-4">Please log in to view your profile.</p>
        <button
          onClick={() => setShowUserLogin(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition"
        >
          Open login
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 px-4 md:px-0 max-w-2xl mx-auto pb-16">
      <BackButton />
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 mt-8">Your Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-6">
        <div>
          <p className="font-semibold text-gray-900">Required details</p>
          <p className="text-sm text-gray-500 mt-1">
            Keep your contact details updated for orders and delivery updates.
          </p>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "";
                  setPreview("");
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                No photo
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold text-lg">Profile photo</p>
              <p className="text-gray-600 text-sm">Optional</p>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="avatarInput"
                className="text-indigo-600 text-sm cursor-pointer font-medium"
              >
                Choose photo
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </label>
              {file ? (
                <p className="text-xs text-gray-500">
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  JPG/PNG up to 2MB. Square images look best.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap -mt-2">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-5 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:bg-indigo-200 disabled:text-white/80 transition"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
          {(user.avatar || preview) && (
            <button
              onClick={handleRemove}
              disabled={isRemoving || isUploading}
              className="px-4 py-2 text-sm border border-red-200 text-red-600 rounded-full hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRemoving ? "Removing..." : "Remove photo"}
            </button>
          )}
          {file && (
            <button
              onClick={() => {
                setFile(null);
                setPreview(normalizeAvatarUrl(user.avatar));
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition"
            >
              Cancel selection
            </button>
          )}
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <label className="text-gray-500 block mb-1">Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-3 border border-gray-100 bg-gray-50 rounded-md text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-gray-500 block mb-1">Phone number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={user.phoneNumber || ""}
              onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleSaveProfile}
            className="px-8 py-3 bg-indigo-500 text-white rounded-full font-medium hover:bg-indigo-600 transition shadow-md"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;




