import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const slides = [
  {
    title: "Crop Recommendation",
    subtitle: "Find best crop for your soil",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
    path: "/crop",
  },
  {
    title: "Disease Detection",
    subtitle: "Detect plant diseases instantly",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80",
    path: "/disease",
  },
  {
    title: "Weather Alerts",
    subtitle: "Real-time weather updates",
    image:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80",
    path: "/alerts",
  },
  {
    title: "Crop Yield Prediction",
    subtitle: "Predict your farm output",
    image:
      "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1600&q=80",
    path: "/yield",
  },
];

const Home = () => {
  const navigate = useNavigate();

  const [slideIndex, setSlideIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [pos, setPos] = useState([20, 85]);
  const [zoom, setZoom] = useState(13);
  const [count, setCount] = useState(0);

  // AUTO SLIDER
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // COUNTER SAFE
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 20;
      if (start >= 1000) {
        setCount(1000);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // WEATHER + LOCATION SAFE
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const lat = p.coords.latitude;
          const lon = p.coords.longitude;

          setPos([lat, lon]);
          setZoom(15);

          const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,precipitation`,
            {
              withCredentials: false,
              timeout: 5000,
            },
          );
          const currentHour = new Date().getHours();

          setWeather({
            temperature: res?.data?.current?.temperature_2m ?? 0,
            windspeed: res?.data?.current?.wind_speed_10m ?? 0,
            rainfall: res?.data?.current?.precipitation ?? 0,
          });
        } catch (err) {
          console.error("Weather fetch failed", err);
          setWeather({
            temperature: 0,
            windspeed: 0,
            rainfall: 0,
          });
        }
      },
      () => {
        // user denied location
        setWeather({
          temperature: 0,
          windspeed: 0,
          rainfall: 0,
        });
      },
    );
  }, []);

  return (
    <div className="text-white bg-gradient-to-br from-green-900 via-black to-green-800 min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.15),transparent_70%)]"></div>

      {/* HERO */}
      <section className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            onClick={() => navigate(slides?.[slideIndex]?.path || "/")}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 cursor-pointer"
          >
            <img
              src={slides?.[slideIndex]?.image}
              onError={(e) => (e.target.style.display = "none")}
              className="w-full h-full object-cover"
              alt=""
            />

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-2xl md:text-5xl font-extrabold">
                {slides?.[slideIndex]?.title}
              </h1>

              <p className="mt-3 text-gray-300">
                {slides?.[slideIndex]?.subtitle}
              </p>

              <button className="mt-6 bg-green-500 px-6 py-3 rounded-xl">
                Explore →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* LEFT */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition"
        >
          <ChevronLeft size={20} />
        </motion.button>

        {/* RIGHT */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 transition"
        >
          <ChevronRight size={20} />
        </motion.button>

        {/* DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides?.map((_, i) => (
            <div
              key={i}
              onClick={() => setSlideIndex(i)}
              className={`h-2 w-2 rounded-full cursor-pointer ${
                i === slideIndex ? "bg-green-400" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* WEATHER + MAP */}
      <section className="py-12 px-4 grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="bg-white/10 p-5 rounded-2xl border border-white/20">
          <h2 className="text-green-300 text-xl font-semibold mb-3">
            🌦 Weather Alerts
          </h2>

          {weather ? (
            <>
              <p>🌡 Temperature: {weather.temperature}°C</p>
              <p>💨 Wind Speed: {weather.windspeed} km/h</p>
              <p>🌧 Rainfall: {weather.rainfall} mm</p>
            </>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>

        <div className="h-64 rounded-2xl overflow-hidden border border-white/20">
          <MapContainer
            key={pos.join(",")}
            center={pos}
            zoom={zoom}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={pos} />
          </MapContainer>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 text-center">
        <h2 className="text-green-300 mb-6">📊 Impact</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-3xl">{count}+</h3>
            <p>Predictions</p>
          </div>

          <div>
            <h3 className="text-3xl">500+</h3>
            <p>Farmers</p>
          </div>

          <div>
            <h3 className="text-3xl">95%</h3>
            <p>Accuracy</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-400 bg-black border-t border-white/10">
        © 2026 Smart Agriculture
      </footer>
    </div>
  );
};

export default Home;
