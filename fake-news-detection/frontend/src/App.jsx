import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import API from "./services/api";
import { motion } from "framer-motion";
import { FaNewspaper, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function App() {
  const [news, setNews] = useState("");
  const [prediction, setPrediction] = useState("");
  const [model, setModel] = useState("nb");
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState("");
  const [modelUsed, setModelUsed] = useState("");
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("predictionHistory")) || [];
  });

  const handlePrediction = async () => {
    if (!news.trim()) {
      alert("Please enter news text");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/predict", {
        text: news,
        model: model,
      });

      setPrediction(response.data.prediction);
      setConfidence(response.data.confidence);
      setModelUsed(response.data.model_used);
      const newPrediction = {
        text: news.substring(0, 100),
        prediction: response.data.prediction,
        confidence: response.data.confidence,
        time: new Date().toLocaleString(),
      };

      const updatedHistory = [newPrediction, ...history];

      setHistory(updatedHistory);

      localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.log(error);
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };
  const data =
    prediction === "Real News"
      ? [
          { name: "Real News", value: confidence || 0 },
          { name: "Fake News", value: 100 - confidence || 0 },
        ]
      : [
          { name: "Fake News", value: confidence || 0 },
          { name: "Real News", value: 100 - confidence || 0 },
        ];

  const COLORS = ["#22c55e", "#ef4444"];
  return (
    <div
      className="min-h-screen bg-black/70 bg-blend-overlay flex items-center justify-center p-5"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-4xl"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaNewspaper className="text-4xl text-cyan-400" />

          <h1 className="text-4xl font-bold text-white">Fake News Detection</h1>
        </div>

        <p className="text-gray-300 text-center mb-8">
          Analyze news articles using Machine Learning models
        </p>

        <textarea
          rows="10"
          placeholder="Paste your news article here..."
          value={news}
          onChange={(e) => setNews(e.target.value)}
          className="w-full p-5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400"
        />

        <div className="mt-5 flex flex-col md:flex-row gap-4">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="flex-1 p-4 rounded-2xl bg-white/10 border border-white/20 text-white outline-none"
          >
            <option value="nb" className="text-black">
              Naive Bayes
            </option>

            <option value="lr" className="text-black">
              Logistic Regression
            </option>
          </select>

          <button
            onClick={handlePrediction}
            className="bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 text-black font-bold px-8 py-4 rounded-2xl shadow-lg"
          >
            {loading ? "Analyzing..." : "Check News"}
          </button>
        </div>

        {prediction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-8 p-6 rounded-2xl border ${
              prediction === "Real News"
                ? "bg-green-500/20 border-green-400"
                : "bg-red-500/20 border-red-400"
            }`}
          >
            <div className="flex items-center gap-3">
              {prediction === "Real News" ? (
                <FaCheckCircle className="text-3xl text-green-400" />
              ) : (
                <FaTimesCircle className="text-3xl text-red-400" />
              )}

              <div>
                <h2 className="text-2xl font-bold text-white">{prediction}</h2>

                <p className="text-gray-300 mt-2">
                  Model analyzed the news article successfully
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-cyan-300 font-semibold">
                    Confidence: {confidence}%
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
                    <div
                      className="bg-cyan-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>

                  <p className="text-cyan-300 font-semibold">
                    Model Used: {modelUsed}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Model Statistics
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-gray-300">
                  <span>Logistic Regression Accuracy</span>
                  <span>97%</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                  <div className="bg-cyan-400 h-4 rounded-full w-[97%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-gray-300">
                  <span>Naive Bayes Accuracy</span>
                  <span>95%</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
                  <div className="bg-green-400 h-4 rounded-full w-[95%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              Prediction Distribution
            </h2>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
        <div className="mt-10 bg-white/10 border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Prediction History
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-black/20 p-4 rounded-xl border border-white/10"
              >
                <p className="text-gray-400 text-sm">{item.time}</p>

                <p className="text-white mt-2">{item.text}...</p>

                <div className="flex justify-between mt-3">
                  <span
                    className={`font-bold ${
                      item.prediction === "Real News"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.prediction}
                  </span>

                  <span className="text-cyan-300">{item.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
