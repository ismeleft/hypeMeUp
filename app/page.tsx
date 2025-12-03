"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Send,
  Ghost,
  Crosshair,
  BookOpen,
  MessageCircle,
  Flame,
} from "lucide-react";

// 模擬 Stranger Things 風格的微粒 (The Upside Down Spores)
const Spore = ({ delay, index }: { delay: number; index: number }) => {
  const [startX] = useState(() => (index * 71) % 100); // 使用 index 生成固定的 x 位置百分比
  const [endX] = useState(() => (index * 37) % 100);
  const [duration] = useState(() => 15 + (index % 10));

  return (
    <motion.div
      initial={{ y: "110vh", x: `${startX}%`, opacity: 0 }}
      animate={{
        y: "-10vh",
        x: `${endX}%`,
        opacity: [0, 0.8, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
      className="absolute w-1 h-1 bg-gray-400 rounded-full blur-[1px] pointer-events-none z-0"
    />
  );
};

const categories = [
  { id: "Project", label: "PROJECT", icon: Crosshair },
  { id: "Learning", label: "LEARNING", icon: BookOpen },
  { id: "Communication", label: "COMM", icon: MessageCircle },
  { id: "Firefighting", label: "CRISIS", icon: Flame },
];

interface RecentWin {
  id: string;
  title: string;
  content: string;
  category: string;
  impact: number;
  date: string;
  createdAt: string;
}

export default function HypePage() {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [impact, setImpact] = useState(0); // 1-5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hypeLevel, setHypeLevel] = useState(0);
  const [entryLogNumber, setEntryLogNumber] = useState(0);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [isLoadingWins, setIsLoadingWins] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  // 載入最近的成就記錄
  const loadRecentWins = async () => {
    try {
      setIsLoadingWins(true);
      const response = await fetch("/api/recent-wins?limit=5");
      const data = await response.json();

      if (data.success) {
        setRecentWins(data.wins);
      }
    } catch (error) {
      console.error("Failed to load recent wins:", error);
    } finally {
      setIsLoadingWins(false);
    }
  };

  // 初次載入
  useEffect(() => {
    loadRecentWins();
  }, []);

  // 計算整體 Hype 值 (文字長度 + 評分加成)
  useEffect(() => {
    let level = Math.min(input.length * 1.5, 60);
    if (impact > 0) level += impact * 8; // 評分加成
    setHypeLevel(Math.min(level, 100));
  }, [input, impact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !category || !impact) return;

    setIsSubmitting(true);

    try {
      // 提交到 API
      const response = await fetch("/api/hype", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          category: category,
          impact: impact,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 成功
        setShowSuccess(true);
        setEntryLogNumber(Math.floor(Math.random() * 9999));
        // 重新載入最近的記錄
        loadRecentWins();
      } else {
        // 失敗
        console.error("Submission failed:", data.error);
        alert(`Failed to submit: ${data.error}`);
      }
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccess(false);
    setInput("");
    setCategory("");
    setImpact(0);
    setHypeLevel(0);
    setEntryLogNumber(0);
  };

  // 生成週報
  const handleGenerateWeeklyReport = async () => {
    try {
      setIsGeneratingReport(true);
      setReportResult(null);

      const response = await fetch("/api/generate-weekly-report", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setReportResult(data.report);
        setTimeout(() => setReportResult(null), 10000); // 10秒後清除訊息
      } else {
        alert(`Failed to generate report: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 判斷表單是否完成
  const isValid = input.length > 0 && category !== "" && impact > 0;

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-x-hidden flex flex-col items-center justify-center font-serif text-slate-100 selection:bg-red-900 selection:text-white pb-10">
      {/* 背景特效層 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
      <motion.div
        animate={{ opacity: hypeLevel / 150 }}
        className="absolute inset-0 bg-red-900 mix-blend-overlay z-0 pointer-events-none transition-opacity duration-500"
      />
      {[...Array(20)].map((_, i) => (
        <Spore key={i} delay={i * 0.5} index={i} />
      ))}

      {/* 雜訊紋理 */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-20 w-full max-w-2xl px-6 mt-10">
        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
            >
              {/* HEADER */}
              <div className="mb-16 text-center relative">
                <motion.h1
                  initial={{ textShadow: "0 0 0px #000" }}
                  animate={{
                    textShadow: [
                      "0 0 10px #ef4444",
                      "0 0 20px #b91c1c",
                      "0 0 10px #ef4444",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-5xl md:text-7xl font-black tracking-widest text-transparent uppercase"
                  style={{
                    WebkitTextStroke: "2px #ef4444",
                    fontFamily: '"Times New Roman", Times, serif',
                  }}
                >
                  HYPE
                  <br />
                  YOURSELF
                </motion.h1>
                <div className="h-0.5 bg-red-800 w-full max-w-[200px] mx-auto mt-4 shadow-[0_0_10px_#ef4444]" />
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. TEXT INPUT */}
                <div className="relative group">
                  <motion.textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="WHAT DID YOU CRUSH TODAY?"
                    className="w-full bg-slate-900/80 border border-red-900/50 rounded-sm p-4 text-xl text-red-50 placeholder-red-900/40 focus:outline-none focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all resize-none min-h-[120px] font-sans tracking-wider backdrop-blur-sm"
                  />
                  {/* 裝飾邊角 */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 2. CATEGORY SELECTOR */}
                  <div className="space-y-4">
                    <label className="text-xs text-red-500 font-mono tracking-[0.2em] uppercase block mb-2 opacity-80"></label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <motion.button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              relative flex items-center justify-center gap-2 py-4 px-3 border transition-all duration-300
                              ${
                                isSelected
                                  ? "bg-red-900/40 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                  : "bg-slate-900/50 border-red-900/30 text-red-900/60 hover:border-red-500/50 hover:text-red-400"
                              }
                            `}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                isSelected ? "animate-pulse" : ""
                              }`}
                            />
                            <span className="text-xs font-bold tracking-widest">
                              {cat.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. IMPACT RATING (VOLTAGE) */}
                  <div className="space-y-4">
                    <label className="text-xs text-red-500 font-mono tracking-[0.2em] uppercase block mb-2 opacity-80"></label>
                    <div className="flex justify-between items-center h-full bg-slate-900/50 border border-red-900/30 p-4 rounded-sm relative overflow-hidden">
                      {/* 背景格線 */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(153,27,27,0.1)_50%,transparent_51%)] bg-[length:20%_100%] pointer-events-none" />

                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.button
                          key={level}
                          type="button"
                          onClick={() => setImpact(level)}
                          whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                          whileTap={{ scale: 0.9 }}
                          className="relative z-10 group focus:outline-none"
                        >
                          <Zap
                            className={`
                              w-8 h-8 transition-all duration-300
                              ${
                                impact >= level
                                  ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                                  : "text-red-900/30 fill-none group-hover:text-red-700"
                              }
                            `}
                          />
                          {impact >= level && (
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-mono">
                              {level}K
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON AREA */}
                <div className="pt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center space-x-2 text-red-800 text-[10px] font-mono tracking-widest uppercase">
                    <Ghost className="w-3 h-3 animate-pulse" />
                    <span>Psychokinetic Energy: {hypeLevel}%</span>
                  </div>

                  <motion.button
                    disabled={!isValid || isSubmitting}
                    whileHover={
                      isValid
                        ? {
                            scale: 1.05,
                            textShadow: "0 0 8px rgb(255,255,255)",
                          }
                        : {}
                    }
                    whileTap={isValid ? { scale: 0.95 } : {}}
                    animate={isSubmitting ? { x: [-2, 2, -2, 2, 0] } : {}}
                    className={`
                      w-full relative px-8 py-4 font-black text-xl tracking-[0.2em] uppercase border transition-all
                      ${
                        isValid
                          ? "bg-red-700 hover:bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] cursor-pointer"
                          : "bg-slate-900 text-red-900/40 border-red-900/20 cursor-not-allowed"
                      }
                    `}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <Zap className="w-5 h-5 animate-spin" /> UPLOADING...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        HYPE ME UP <Send className="w-5 h-5" />
                      </span>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            // SUCCESS SCREEN
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              className="text-center space-y-8 py-10"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-block p-6 rounded-full border-2 border-red-500 shadow-[0_0_50px_#ef4444] bg-slate-900 relative"
              >
                <Sparkles className="w-16 h-16 text-red-500" />
                <div className="absolute inset-0 border border-red-500 rounded-full animate-ping opacity-20" />
              </motion.div>

              <div>
                <h2
                  className="text-4xl md:text-5xl font-bold text-red-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] mb-2"
                  style={{ fontFamily: '"Times New Roman", serif' }}
                >
                  Recorded
                </h2>
                <p className="text-red-800/80 font-mono text-xs tracking-[0.3em]">
                  ENTRY LOG #{entryLogNumber}
                </p>
              </div>

              <div className="bg-slate-900/80 border-l-4 border-red-700 p-6 relative overflow-hidden text-left max-w-lg mx-auto shadow-2xl">
                <div className="flex justify-between items-start mb-4 border-b border-red-900/30 pb-2">
                  <span className="text-xs text-red-500 font-bold uppercase tracking-widest">
                    {category}
                  </span>
                  <div className="flex">
                    {[...Array(impact)].map((_, i) => (
                      <Zap
                        key={i}
                        className="w-3 h-3 text-red-500 fill-red-500"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-lg text-gray-300 font-sans italic leading-relaxed">
                  &quot;{input}&quot;
                </p>
              </div>

              <button
                onClick={handleReset}
                className="mt-8 text-gray-500 hover:text-red-400 hover:tracking-widest transition-all font-mono text-xs uppercase"
              >
                [ Enter New Data ]
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RECENT WINS SECTION */}
        {!showSuccess && recentWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-red-900/30 pb-3">
              <h2 className="text-red-500 text-lg font-bold uppercase tracking-widest">
                Recent Achievements
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-red-800 text-xs font-mono">
                  {recentWins.length} LOGGED
                </span>
                <motion.button
                  onClick={handleGenerateWeeklyReport}
                  disabled={isGeneratingReport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all
                    ${
                      isGeneratingReport
                        ? "bg-slate-900 text-red-900/40 border-red-900/20 cursor-not-allowed"
                        : "bg-red-900/30 text-red-500 border-red-500/50 hover:bg-red-900/50 hover:border-red-500"
                    }
                  `}
                >
                  {isGeneratingReport ? "GENERATING..." : "WEEKLY REPORT"}
                </motion.button>
              </div>
            </div>

            <div className="space-y-6">
              {isLoadingWins ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto" />
                  <p className="text-red-800 text-sm mt-4">Loading...</p>
                </div>
              ) : (
                recentWins.map((win, index) => (
                  <motion.div
                    key={win.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                    className="bg-slate-900/50 border border-red-900/30 p-6 relative overflow-hidden hover:border-red-500/50 transition-all"
                  >
                    {/* 裝飾邊角 */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />

                    <div className="flex items-start gap-6">
                      {/* Impact Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 flex items-center justify-center border-2 border-red-500 bg-slate-900 relative">
                          <span className="text-red-500 text-xl font-bold">
                            {win.impact}
                          </span>
                          <div className="absolute inset-0 border border-red-500 animate-ping opacity-20" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-4">
                          <span className="text-red-500 text-xs font-bold uppercase tracking-widest">
                            {win.category}
                          </span>
                          <span className="text-red-800 text-xs font-mono">
                            {new Date(win.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {win.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* WEEKLY REPORT RESULT */}
            <AnimatePresence>
              {reportResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="mt-8 bg-slate-900/80 border-l-4 border-red-500 p-6 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500" />

                  <h3 className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Weekly Report Generated
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Week:</span>
                      <span className="text-red-500 font-mono">{reportResult.week}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Date Range:</span>
                      <span className="text-gray-300 font-mono text-xs">{reportResult.dateRange}</span>
                    </div>
                    <div className="h-px bg-red-900/30 my-3" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Logs:</span>
                      <span className="text-red-500 font-bold">{reportResult.totalLogs}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Impact:</span>
                      <span className="text-red-500 font-bold">{reportResult.totalImpact}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Impact:</span>
                      <span className="text-red-500 font-bold">{reportResult.averageImpact}</span>
                    </div>
                    <div className="h-px bg-red-900/30 my-3" />
                    <div>
                      <span className="text-gray-400 block mb-2">Categories:</span>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(reportResult.categories).map(([cat, count]) => (
                          <span
                            key={cat}
                            className="px-3 py-1 bg-red-900/30 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider"
                          >
                            {cat}: {count as number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500 font-mono text-center">
                    Report saved to Notion • ID: {reportResult.pageId.substring(0, 8)}...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FOOTER DECORATION */}
      <div className="fixed bottom-4 w-full flex justify-between px-10 text-[10px] text-red-900/30 font-mono tracking-[0.2em] z-20 pointer-events-none">
        <span>HAWKINS POWER & LIGHT</span>
        <span>v2.0.25</span>
      </div>
    </div>
  );
}
