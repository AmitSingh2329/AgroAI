import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image")) {
      setError("Only image files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  // ✅ Prevent memory leak
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please upload an image");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", image);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/disease/detect`,
        formData,
        {
          withCredentials: true,
          timeout: 60000,
        }
      );

      console.log("API:", res.data);

      if (res.data.error) {
        setError(res.data.error);
        setResult(null);
        return;
      }

      setResult(res.data.result);

      // ✅ Auto scroll to result
      setTimeout(() => {
        document
          .getElementById("result-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Detection failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative bg-gradient-to-br from-green-900 via-black to-green-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_70%)]"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-3xl shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-green-300 text-center mb-2">
          🦠 Disease Detection
        </h1>

        <p className="text-center text-sm text-gray-300 mb-5">
          Upload a plant leaf image to detect disease
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="block border-2 border-dashed border-green-400/70 p-6 rounded-xl text-center cursor-pointer hover:bg-white/10 transition"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
            <p className="text-white font-medium text-lg">
              📸 Upload Leaf Image
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>
          </motion.label>

          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <img
                src={preview}
                alt="preview"
                className="w-full h-48 object-cover rounded-xl shadow-lg group-hover:brightness-75 transition"
              />

              <button
                type="button"
                onClick={reset}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-lg"
              >
                ✕
              </button>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            type="submit"
            disabled={loading || !image}
            className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white py-2 rounded-xl font-semibold shadow-lg disabled:bg-gray-500"
          >
            {loading ? "🔄 Detecting..." : "Detect Disease"}
          </motion.button>
        </form>

        {/* ✅ Error UI */}
        {error && (
          <div className="mt-3 bg-red-500/20 border border-red-400/40 p-3 rounded text-center">
            ❌ {error}
          </div>
        )}

        {/* ✅ Result Section */}
        {result && (
          <motion.div
            id="result-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-center shadow-lg"
          >
            <h2 className="text-lg font-semibold text-green-300">
              🌱 Disease Detection Result
            </h2>

            <img
              src={preview}
              alt="leaf"
              className="w-24 h-24 object-cover rounded-lg mx-auto mt-3 mb-3"
            />

            {result?.fallback ? (
              <p className="text-yellow-400">
                ⚠️ Please upload a clear plant leaf image
              </p>
            ) : (
              <p className="text-xl font-bold mt-2 text-white">
                {result?.disease || "Unknown"}
              </p>
            )}

            <button
              onClick={reset}
              className="mt-3 text-sm text-blue-300 underline hover:text-blue-400"
            >
              Try another image
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DiseaseDetection;