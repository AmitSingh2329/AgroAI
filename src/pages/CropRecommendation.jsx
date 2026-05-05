import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CropRecommendation = () => {
  const [form, setForm] = useState({
    lat: null,
    lon: null,
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    soil: "Loamy",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resultRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }));
        },
        () => alert("Please enable location access"),
      );
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.lat || !form.lon) {
    setError("Location not ready");
    return;
  }

  if (!form.nitrogen || !form.phosphorus || !form.potassium || !form.ph) {
    setError("Please fill all fields");
    return;
  }

  setLoading(true);

  const safeNumber = (val) => (val === "" ? 0 : Number(val));

  try {
    const payload = {
      lat: form.lat,
      lon: form.lon,
      nitrogen: safeNumber(form.nitrogen),
      phosphorus: safeNumber(form.phosphorus),
      potassium: safeNumber(form.potassium),
      ph: safeNumber(form.ph),
      soil: form.soil,
    };

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/crop/predict`,
      payload,
      { withCredentials: true, timeout: 8000 }
    );

    setResult(res.data);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

  } catch (err) {
    setError(
      err?.response?.data?.error ||
      err?.message ||
      "Prediction failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-[calc(100vh-64px)] w-full px-4 py-6 bg-gradient-to-br from-green-900 via-black to-green-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_70%)]"></div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent"
          >
            Smart Crop Recommendation
          </motion.h1>

          <p className="text-gray-300 mt-2">
            AI-powered insights to maximize your crop yield
          </p>
        </div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/20 mb-10"
        >
          <form className="grid md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
            {[
              { name: "nitrogen", placeholder: "🌿 Nitrogen" },
              { name: "phosphorus", placeholder: "🧪 Phosphorus" },
              { name: "potassium", placeholder: "⚡ Potassium" },
              { name: "ph", placeholder: "🌡 Soil pH" },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                placeholder={field.placeholder}
                onChange={handleChange}
                required
                className="p-3 rounded-xl bg-white/80 text-black"
              />
            ))}

            <select
              name="soil"
              onChange={handleChange}
              value={form.soil} 
              className="p-3 rounded-xl bg-white/80 text-black md:col-span-2"
            >
              <option>Black Soil</option>
              <option>Red Soil</option>
              <option>Alluvial</option>
              <option>Clay</option>
              <option>Clay Loam</option>
              <option>Loamy</option>
              <option>Sandy</option>
              <option>Sandy Loam</option>
            </select>

            <button
              type="submit"
              disabled={!form.lat || loading}
              className="md:col-span-2 bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold"
            >
              {loading ? "Predicting..." : "Get Recommendation"}
            </button>
          </form>
        </motion.div>

        {/* RESULT */}
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* BEST CROP */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 text-center">
              <h2 className="text-2xl text-green-300">🌾 Best Crop</h2>
              <p className="text-3xl font-bold mt-2">
                {result?.recommendedCrops?.best_crop || "N/A"}
              </p>
            </div>

            {/* WEATHER */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
              <h3 className="mb-2 text-lg">🌦 Weather</h3>
              <p>🌡 {result?.weather?.temperature?.toFixed?.(1) ?? "--"}°C</p>
              <p>💧 {result?.weather?.humidity ?? "--"}%</p>
              <p>🌧 {result?.weather?.rainfall ?? "--"}</p>
            </div>

            {/* TOP CROPS */}
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
              <h3 className="mb-3">📊 Top Crops</h3>

              {Array.isArray(
                result?.recommendedCrops?.top_3_recommendations,
              ) ? (
                result.recommendedCrops.top_3_recommendations.map((crop, i) => {
                  const c = ((crop.probability || 0) * 100).toFixed(1);
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between">
                        <span>{crop.crop || "Unknown"}</span>
                        <span>{c}%</span>
                      </div>
                      <div className="bg-gray-700 h-2 mt-1 rounded">
                        <div
                          className="bg-green-400 h-2 rounded"
                          style={{ width: `${c}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No recommendations available</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
