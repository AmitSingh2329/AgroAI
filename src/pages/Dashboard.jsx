import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ user, setUser }) => {
  const [data, setData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    return `${import.meta.env.VITE_BACKEND_URL}/uploads/${img}`;
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data);
        setUser(res.data);
      })
      .catch(() => {
        setError("Session expired. Please login again");
        navigate("/login");
      });
  }, [navigate, setUser]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.log("Logout failed, forcing logout");
    }
    setUser(null);
    navigate("/login");
  };

  const handleDeleteCrop = async (id) => {
    if (!window.confirm("Delete this crop history?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/crop/${id}`,
        { withCredentials: true },
      );

      setData((prev) => ({
        ...prev,
        cropHistory: (prev?.cropHistory || []).filter(
          (i) => i?._id?.toString() !== id,
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!window.confirm("Delete this disease record?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/disease/${id}`,
        { withCredentials: true },
      );

      setData((prev) => ({
        ...prev,
        diseaseHistory: (prev?.diseaseHistory || []).filter(
          (i) => i?._id?.toString() !== id,
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleDeleteYield = async (id) => {
    if (!window.confirm("Delete this yield record?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/yield/${id}`,
        { withCredentials: true },
      );

      setData((prev) => ({
        ...prev,
        yieldHistory: (prev?.yieldHistory || []).filter(
          (i) => i?._id?.toString() !== id,
        ),
      }));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (!data) {
    return (
      <div className="text-center text-white p-10">Loading dashboard... </div>
    );
  }

  const cropHistory = [...(data?.cropHistory || [])].reverse();
  const diseaseHistory = [...(data?.diseaseHistory || [])].reverse();
  const yieldHistory = [...(data?.yieldHistory || [])].reverse();

  const getColor = (val) => {
    if (val >= 75) return "bg-gradient-to-r from-green-400 to-green-600";
    if (val >= 50) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    return "bg-gradient-to-r from-red-400 to-red-600";
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-green-900 via-black to-green-800 p-6">
      {/* ERROR MESSAGE */}
      {error && <p className="text-red-400 text-center mb-4">{error}</p>}
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide">
          Dashboard
          <span className="block text-lg font-medium text-green-300 mt-1">
            Welcome back, {data?.name || "User"}
          </span>
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500/80 hover:bg-red-600 transition px-6 py-2 rounded-xl text-white font-semibold shadow-lg"
        >
          Logout
        </button>
      </div>
      {/* 🌱 CROP HISTORY */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-green-300 mb-5">Crop History</h2>

        {cropHistory.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center border border-white/20">
            <p className="text-gray-300 text-lg">No crop predictions yet</p>
            <button
              onClick={() => navigate("/crop")}
              className="mt-4 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-semibold transition"
            >
              ➕ Predict Crop
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cropHistory.map((item) => {
              const confidence = item?.result?.probability
                ? item.result.probability * 100
                : 0;

              return (
                <div
                  key={item?._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition"
                >
                  <p className="text-xs text-gray-400 mb-2">
                    📅{" "}
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Unknown"}
                  </p>

                  <h2 className="text-xl font-bold text-green-400">
                    🌱 {item?.result?.best_crop || "N/A"}
                  </h2>

                  <p className="text-sm text-gray-200 mt-1">
                    Confidence: {Number(confidence || 0).toFixed(1)}%
                  </p>

                  <div className="w-full bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`${getColor(confidence)} h-2 rounded-full`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-1">
                      📊 Top Recommendations
                    </h3>

                    {Array.isArray(item?.result?.top_3_recommendations) ? (
                      item.result.top_3_recommendations.map((crop, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm text-gray-200"
                        >
                          <span>{crop?.crop || "Unknown"}</span>
                          <span>
                            {Number(crop?.probability || 0 * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>No data</p>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-gray-300 space-y-1">
                    <p>🌡 {item?.input?.temperature ?? "--"}°C</p>
                    <p>💧 {item?.input?.humidity ?? "--"}%</p>
                    <p>🌧 {item?.input?.rainfall ?? "--"}</p>
                    <p>🌱 {item?.input?.soil ?? "--"}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteCrop(item?._id)}
                    className="mt-4 text-red-400 hover:text-red-500 text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* 🦠 DISEASE HISTORY */}
      <section className="max-w-7xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-green-300 mb-5">
          Disease History
        </h2>

        {diseaseHistory.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center border border-white/20">
            <p className="text-gray-300 text-lg">No disease detection yet</p>
            <button
              onClick={() => navigate("/disease")}
              className="mt-4 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-semibold"
            >
              ➕ Detect Disease
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diseaseHistory.map((item) => {
              const imageUrl = getImageUrl(item?.image);

              return (
                <div
                  key={item?._id}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl hover:scale-[1.02] transition"
                >
                  {item?.image ? (
                    <img
                      src={imageUrl}
                      onError={(e) => (e.target.style.display = "none")}
                      onClick={() => setPreviewImage(imageUrl)}
                      className="w-full h-44 object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
                      alt="leaf"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    📅{" "}
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "Unknown"}
                  </p>

                  <h3 className="text-lg font-semibold text-green-400 mt-1">
                    🌱 {item?.result?.disease || "Unknown"}
                  </h3>

                  <button
                    onClick={() => handleDeleteDisease(item?._id)}
                    className="mt-2 text-red-400 hover:text-red-500 text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* 🔍 IMAGE PREVIEW */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <img
            src={previewImage}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-[90%] rounded-2xl shadow-2xl"
            alt=""
          />

          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white text-3xl"
          >
            ✕
          </button>
        </div>
      )}
      {/* 🌾 YIELD HISTORY */}
      <section className="max-w-7xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-green-300 mb-5">
          Yield History
        </h2>

        {yieldHistory.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl text-center border border-white/20">
            <p className="text-gray-300 text-lg">No yield predictions yet</p>
            <button
              onClick={() => navigate("/yield")}
              className="mt-4 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg text-white font-semibold"
            >
              ➕ Predict Yield
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yieldHistory.map((item) => (
              <div
                key={item?._id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition"
              >
                <p className="text-xs text-gray-400 mb-2">
                  📅{" "}
                  {item?.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Unknown"}
                </p>

                <h2 className="text-xl font-bold text-green-400">
                  🌾 Yield:{" "}
                  {Number(item?.result?.predicted_yield || 0).toFixed(2)}
                </h2>

                <div className="mt-3 text-sm text-gray-300 space-y-1">
                  <p>🌱 Crop: {item?.input?.crop || "--"}</p>
                  <p>📍 State: {item?.input?.state || "--"}</p>
                  <p>📅 Year: {item?.input?.year || "--"}</p>
                  <p>🌧 Rainfall: {item?.input?.rainfall ?? "--"}</p>
                </div>

                <div className="mt-3 text-sm text-gray-400 space-y-1">
                  <p>📏 Area: {item?.input?.area ?? "--"}</p>
                  <p>🧪 Fertilizer: {item?.input?.fertilizer ?? "--"}</p>
                  <p>☠ Pesticide: {item?.input?.pesticide ?? "--"}</p>
                </div>

                <button
                  onClick={() => handleDeleteYield(item?._id)}
                  className="mt-4 text-red-400 hover:text-red-500 text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
