// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";

// const YieldPrediction = () => {
//   const initialForm = {
//     crop: "",
//     year: "",
//     season: "",
//     state: "",
//     area: "",
//     fertilizer: "",
//     pesticide: "",
//   };

//   const [form, setForm] = useState(initialForm);
//   const [submittedData, setSubmittedData] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const [location, setLocation] = useState({ lat: null, lon: null });

//   const resultRef = useRef(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // 🌍 Get user location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setLocation({
//             lat: pos.coords.latitude,
//             lon: pos.coords.longitude,
//           });
//         },
//         (err) => {
//           console.error("Location error:", err.message);
//         },
//       );
//     }
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.crop || !form.year || !form.season || !form.state) {
//       alert("Fill all fields");
//       return;
//     }

//     if (!location.lat || !location.lon) {
//       alert("Please allow location access");
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         crop: form.crop,
//         year: Number(form.year),
//         season: form.season || "WholeYear",
//         state: form.state,
//         area: Number(form.area),
//         fertilizer: Number(form.fertilizer),
//         pesticide: Number(form.pesticide),
//         lat: location.lat,
//         lon: location.lon,
//       };

//       const res = await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/yield/predict`,
//         payload,
//         { withCredentials: true },
//       );

//       setSubmittedData(form);
//       setResult(res.data.result || res.data);

//       // 🔥 Auto scroll to result
//       setTimeout(() => {
//         resultRef.current?.scrollIntoView({ behavior: "smooth" });
//       }, 200);
//     } catch (err) {
//       alert("Prediction failed");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-[calc(100vh-64px)] w-full px-4 py-6 bg-gradient-to-br from-green-900 via-black to-green-800 text-white">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_70%)]"></div>

//       <div className="relative z-10 max-w-6xl mx-auto">
//         {/* HEADER */}
//         <div className="text-center mb-8">
//           <motion.h1
//             initial={{ opacity: 0, y: -30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent"
//           >
//             Smart Yield Prediction
//           </motion.h1>

//           <p className="text-gray-300 mt-2">
//             AI-powered insights to estimate crop yield
//           </p>
//         </div>

//         {/* FORM */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/20 mb-10"
//         >
//           <form className="grid md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
//             <input
//               name="crop"
//               value={form.crop}
//               onChange={handleChange}
//               placeholder="🌱 Crop"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             <input
//               name="year"
//               value={form.year}
//               onChange={handleChange}
//               placeholder="📅 Year"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             <input
//               name="state"
//               value={form.state}
//               onChange={handleChange}
//               placeholder="📍 State"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             <input
//               name="area"
//               value={form.area}
//               onChange={handleChange}
//               placeholder="📏 Area (hectares)"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             <input
//               name="fertilizer"
//               value={form.fertilizer}
//               onChange={handleChange}
//               placeholder="🧪 Fertilizer (kg)"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             <input
//               name="pesticide"
//               value={form.pesticide}
//               onChange={handleChange}
//               placeholder="☠ Pesticide (kg)"
//               className="p-3 rounded-xl bg-white/80 text-black"
//             />

//             {/* ✅ Season full width */}
//             <select
//               name="season"
//               value={form.season}
//               onChange={handleChange}
//               className="md:col-span-2 p-3 rounded-xl bg-white/80 text-black"
//             >
//               <option value="">Select Season</option>
//               <option value="WholeYear">Whole Year</option>
//               <option value="Kharif">Kharif</option>
//               <option value="Rabi">Rabi</option>
//               <option value="Zayad">Zayad</option>
//             </select>

//             <button
//               type="submit"
//               disabled={loading}
//               className="md:col-span-2 bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold"
//             >
//               {loading ? "Predicting..." : "Predict Yield"}
//             </button>
//           </form>
//         </motion.div>

//         {/* RESULT */}
//         {result && (
//           <motion.div
//             ref={resultRef}
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="grid md:grid-cols-3 gap-6"
//           >
//             {/* MAIN */}
//             <div className="bg-white/10 p-6 rounded-3xl border border-white/20 text-center">
//               <h2 className="text-2xl text-green-300">📈 Predicted Yield</h2>

//               <p className="text-3xl font-bold mt-2">
//                 {Number(result.predicted_yield).toFixed(2)}{" "}
//                 <span className="text-lg text-gray-300">kg/hectare</span>
//               </p>
//             </div>

//             {/* INPUTS */}
//             <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
//               <h3 className="mb-2 text-lg">📊 Inputs</h3>
//               <p>🌱 {submittedData?.crop}</p>
//               <p>📍 {submittedData?.state}</p>
//               <p>📅 {submittedData?.year}</p>
//               <p>📅 Season: {submittedData?.season}</p>
//             </div>

//             {/* EXTRA */}
//             <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
//               <h3 className="mb-3">⚡ Inputs Used</h3>
//               <p>Area: {submittedData?.area}</p>
//               <p>Fertilizer: {submittedData?.fertilizer}</p>
//               <p>Pesticide: {submittedData?.pesticide}</p>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default YieldPrediction;


import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const YieldPrediction = () => {
const initialForm = {
crop: "",
year: "",
season: "",
state: "",
area: "",
fertilizer: "",
pesticide: "",
};

const [form, setForm] = useState(initialForm);
const [submittedData, setSubmittedData] = useState(null);
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [location, setLocation] = useState({ lat: null, lon: null });

const resultRef = useRef(null);

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

// 🌍 Location
useEffect(() => {
if (navigator.geolocation) {
navigator.geolocation.getCurrentPosition(
(pos) => {
setLocation({
lat: pos.coords.latitude,
lon: pos.coords.longitude,
});
},
() => {
setError("Location access denied");
}
);
}
}, []);

const handleSubmit = async (e) => {
e.preventDefault();

setError("");

if (!form.crop || !form.year || !form.season || !form.state) {
  setError("Fill all required fields");
  return;
}

if (location.lat == null || location.lon == null) {
  setError("Please allow location access");
  return;
}

const payload = {
  crop: form.crop,
  year: Number(form.year) || 0,
  season: form.season || "WholeYear",
  state: form.state,
  area: Number(form.area) || 0,
  fertilizer: Number(form.fertilizer) || 0,
  pesticide: Number(form.pesticide) || 0,
  lat: location.lat,
  lon: location.lon,
};

try {
  setLoading(true);

  const res = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/yield/predict`,
    payload,
    { withCredentials: true }
  );

  setSubmittedData(form);
  setResult(res?.data?.result || res?.data || null);

  setTimeout(() => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 200);

} catch (err) {
  setError(
    err?.response?.data?.message ||
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

    <div className="text-center mb-8">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-500 to-blue-500 bg-clip-text text-transparent"
      >
        Smart Yield Prediction
      </motion.h1>

      <p className="text-gray-300 mt-2">
        AI-powered insights to estimate crop yield
      </p>
    </div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/20 mb-10"
    >
      <form className="grid md:grid-cols-2 gap-5" onSubmit={handleSubmit}>

        <input name="crop" value={form.crop} onChange={handleChange} placeholder="🌱 Crop" className="p-3 rounded-xl bg-white/80 text-black" />
        <input name="year" value={form.year} onChange={handleChange} placeholder="📅 Year" className="p-3 rounded-xl bg-white/80 text-black" />
        <input name="state" value={form.state} onChange={handleChange} placeholder="📍 State" className="p-3 rounded-xl bg-white/80 text-black" />
        <input name="area" value={form.area} onChange={handleChange} placeholder="📏 Area (hectares)" className="p-3 rounded-xl bg-white/80 text-black" />
        <input name="fertilizer" value={form.fertilizer} onChange={handleChange} placeholder="🧪 Fertilizer (kg)" className="p-3 rounded-xl bg-white/80 text-black" />
        <input name="pesticide" value={form.pesticide} onChange={handleChange} placeholder="☠ Pesticide (kg)" className="p-3 rounded-xl bg-white/80 text-black" />

        <select name="season" value={form.season} onChange={handleChange} className="md:col-span-2 p-3 rounded-xl bg-white/80 text-black">
          <option value="">Select Season</option>
          <option value="WholeYear">Whole Year</option>
          <option value="Kharif">Kharif</option>
          <option value="Rabi">Rabi</option>
          <option value="Zayad">Zayad</option>
        </select>

        <button type="submit" disabled={loading} className="md:col-span-2 bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold">
          {loading ? "Predicting..." : "Predict Yield"}
        </button>
      </form>

      {error && (
        <p className="text-red-400 text-center mt-3">{error}</p>
      )}
    </motion.div>

    {result && (
      <motion.div ref={resultRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">

        <div className="bg-white/10 p-6 rounded-3xl border border-white/20 text-center">
          <h2 className="text-2xl text-green-300">📈 Predicted Yield</h2>
          <p className="text-3xl font-bold mt-2">
            {Number(result?.predicted_yield || 0).toFixed(2)}{" "}
            <span className="text-lg text-gray-300">kg/hectare</span>
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
          <h3 className="mb-2 text-lg">📊 Inputs</h3>
          <p>🌱 {submittedData?.crop || "--"}</p>
          <p>📍 {submittedData?.state || "--"}</p>
          <p>📅 {submittedData?.year || "--"}</p>
          <p>📅 Season: {submittedData?.season || "--"}</p>
        </div>

        <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
          <h3 className="mb-3">⚡ Inputs Used</h3>
          <p>Area: {submittedData?.area ?? "--"}</p>
          <p>Fertilizer: {submittedData?.fertilizer ?? "--"}</p>
          <p>Pesticide: {submittedData?.pesticide ?? "--"}</p>
        </div>

      </motion.div>
    )}
  </div>
</div>

);
};

export default YieldPrediction;

