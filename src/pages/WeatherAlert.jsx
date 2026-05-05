import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const WeatherAlerts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Your Location");
  const [error, setError] = useState("");

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }),
        reject,
      );
    });

  const getLocationName = async (lat, lon) => {
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: { format: "json", lat, lon },
          withCredentials: false, // 🔥 MUST
          timeout: 5000,
        },
      );

      const addr = res?.data?.address || {};

      setLocationName(
        addr.city || addr.town || addr.village || addr.state || "Your Location",
      );
    } catch (err) {
      console.error("Location name error:", err.message);
    }
  };

  const fetchAlerts = async () => {
    try {
      setError("");

      let lat = 20.2961;
      let lon = 85.8245;

      try {
        const loc = await getLocation();
        lat = loc.lat;
        lon = loc.lon;

        // ✅ call location API
        getLocationName(lat, lon);
      } catch (err) {
        console.log("Using default location");
      }

      // ✅ call YOUR BACKEND (not Nominatim)
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/alerts`,
        {
          params: { lat, lon },
          withCredentials: true,
          timeout: 5000,
        },
      );

      setData(res?.data || null);
    } catch (err) {
      console.error("Alerts fetch error:", err.message);
      setError("Failed to load weather alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl bg-black animate-pulse">
        🌤 Loading weather insights...
      </div>
    );
  }

  if (error || !data?.weather) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        ⚠️ {error || "Failed to load weather data"}
      </div>
    );
  }

  const weather = data.weather || {};
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  const getStyle = (s) => {
    if (s === "Critical")
      return "bg-gradient-to-r from-red-700 to-red-500 animate-pulse";
    if (s === "High") return "bg-gradient-to-r from-red-500 to-orange-500";
    if (s === "Medium") return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-green-500 to-green-600";
  };

  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-br from-green-900 via-black to-green-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_70%)]"></div>

      <div className="relative z-10 h-full flex flex-col p-5 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-bold">📍 {locationName}</h1>
            <p className="text-sm text-green-300">Smart Weather Alerts</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAlerts}
            className="bg-white/10 backdrop-blur-lg border border-white/20 px-5 py-2 rounded-full hover:bg-white/20 transition"
          >
            🔄 Refresh
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-5 shrink-0">
          <motion.div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl">
            <h2 className="text-sm font-semibold mb-3 text-green-300">
              ⚡ Next 3 Hours
            </h2>

            <div className="flex justify-between text-xl font-bold">
              <span>🌡 {weather.next3Hours?.maxTemp ?? 0}°C</span>
              <span>🌧 {weather.next3Hours?.totalRain ?? 0} mm</span>
            </div>
          </motion.div>

          <motion.div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl">
            <h2 className="text-sm font-semibold mb-3 text-green-300">
              📅 Today
            </h2>

            <div className="grid grid-cols-3 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {weather.fullDay?.maxTemp ?? 0}°
                </p>
                <small>Max</small>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {weather.fullDay?.minTemp ?? 0}°
                </p>
                <small>Min</small>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {weather.fullDay?.maxRain ?? 0}
                </p>
                <small>Rain</small>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <h2 className="text-lg font-bold mb-4 text-green-300">🚨 Alerts</h2>

          {alerts.length === 0 ? (
            <div className="bg-green-500/20 border border-green-400/40 p-4 rounded-xl text-center">
              ✅ No Alerts
            </div>
          ) : (
            alerts.map((a, i) => (
              <motion.div
                key={i}
                className={`mb-3 p-5 rounded-xl shadow-xl ${getStyle(a?.severity)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">
                    {a?.type || "Unknown"}
                  </span>

                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {a?.severity || "Low"}
                  </span>
                </div>

                <p className="text-sm opacity-90">
                  {a?.message || "No details"}
                </p>

                {a?.severity === "High" && (
                  <div className="mt-2 text-xs animate-pulse">
                    ⚠ Take action soon
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherAlerts;
