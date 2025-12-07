"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair,
  Coffee,
  Zap,
  ShoppingBag,
  ShieldAlert,
  BookOpen,
  Target,
} from "lucide-react";
import ConfettiEffect from "@/components/ConfettiEffect";

// 漫畫網點背景 (Halftone Pattern)
const HalftoneBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-10 pointer-events-none"
    style={{
      backgroundImage: "radial-gradient(#000 2px, transparent 2.5px)",
      backgroundSize: "20px 20px",
    }}
  />
);

// 漫畫速度線 (Action Speed Lines)
const SpeedLines = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-black"
        initial={{
          width: Math.random() * 200 + 50 + "px",
          height: Math.random() * 2 + 1 + "px",
          x: (Math.random() - 0.5) * 150 + "vw",
          y: (Math.random() - 0.5) * 150 + "vh",
          rotate: Math.random() * 360,
        }}
        animate={{
          scaleX: [1, 20],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: Math.random() * 0.5,
        }}
      />
    ))}
  </div>
);

// Mapped categories for UI -> Backend compatibility
// Project -> Project
// Learning -> Learning
// Crisis -> Firefighting
// Misc -> Communication
const categories = [
  {
    id: "Project",
    dbId: "Project",
    label: "MISSION",
    sub: "專案",
    icon: Target,
    color: "bg-red-500",
  },
  {
    id: "Learning",
    dbId: "Learning",
    label: "SKILL",
    sub: "修練",
    icon: BookOpen,
    color: "bg-blue-400",
  },
  {
    id: "Crisis",
    dbId: "Firefighting",
    label: "CLEANUP",
    sub: "救火",
    icon: ShieldAlert,
    color: "bg-yellow-400",
  },
  {
    id: "Misc",
    dbId: "Communication",
    label: "STORE",
    sub: "雜務",
    icon: ShoppingBag,
    color: "bg-green-400",
  },
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

export default function SakamotoHype() {
  const [input, setInput] = useState("");
  const [category, setCategory] = useState(""); // This holds the 'id' from categories array
  const [impact, setImpact] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Existing state for functionality
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [isLoadingWins, setIsLoadingWins] = useState(true);

  // Load recent wins
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

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await fetch("/api/generate-weekly-report", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        alert(`Weekly Report Generated! \nWeek: ${data.report.week}\nTotal Impact: ${data.report.totalImpact}`);
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

  useEffect(() => {
    loadRecentWins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !category || !impact) return;

    setIsSubmitting(true);
    
    // Find the correct DB category ID
    const selectedCat = categories.find(c => c.id === category);
    const dbCategory = selectedCat ? selectedCat.dbId : "Communication"; // fallback

    try {
      const response = await fetch("/api/hype", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          category: dbCategory, 
          impact: impact,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        loadRecentWins();
      } else {
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
  };

  const isValid = input.length > 0 && category !== "" && impact > 0;

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center font-sans overflow-x-hidden p-4">
      <ConfettiEffect trigger={showSuccess} />

      {/* 背景裝飾 */}
      <HalftoneBackground />

      {/* 巨大的日文擬聲詞裝飾 */}
      <div
        className="absolute top-10 left-0 text-9xl font-black text-gray-200 pointer-events-none select-none -rotate-12 opacity-50 z-0"
        style={{ fontFamily: "sans-serif" }}
      >
        ドン！
      </div>
      <div
        className="absolute bottom-10 right-0 text-8xl font-black text-gray-200 pointer-events-none select-none rotate-6 opacity-50 z-0"
        style={{ fontFamily: "sans-serif" }}
      >
        ゴゴゴ
      </div>

      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="panel"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-xl"
          >
            {/* 標題卡片 */}
            <div className="bg-white border-4 border-black p-4 mb-6 shadow-[8px_8px_0px_0px_#000] rotate-1">
              <div className="flex justify-between items-end border-b-4 border-black pb-2 mb-2">
                <h1 className="text-6xl font-black italic tracking-tighter text-black leading-[0.8]">
                  DAILY
                  <br />
                  <span className="text-red-600">DAYS</span>
                </h1>
                <div className="text-right">
                  <span className="block text-xs font-bold bg-black text-white px-2 py-1 rotate-3">
                    NO KILL RULE
                  </span>
                  <span 
                    className="block text-sm font-bold mt-1"
                    suppressHydrationWarning
                  >
                    LOG #{new Date().getDate()}
                  </span>
                </div>
              </div>
              <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                // Report your daily achievements
              </p>
            </div>

            {/* 主表單區域 - 像漫畫分鏡框一樣 */}
            <form
              onSubmit={handleSubmit}
              className="bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_#000] relative"
            >
              {/* 1. INPUT: 像是一個對話框 */}
              <div className="mb-8 relative">
                <label className="block text-xl font-black italic mb-2 flex items-center gap-2">
                  <Crosshair className="w-6 h-6" /> TARGET DESCRIPTION
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="今天解決了什麼麻煩...?"
                  className="w-full h-32 bg-gray-50 border-4 border-black p-4 text-xl font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 resize-none transition-colors"
                />
                {/* 裝飾用的圖釘 */}
                <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 border-2 border-black shadow-[2px_2px_0px_0px_#000]" />
              </div>

              {/* 2. CATEGORY: 武器/道具選擇 */}
              <div className="mb-8">
                <label className="block text-xl font-black italic mb-2">
                  SELECT WEAPON
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <motion.button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          relative border-4 border-black p-3 flex items-center gap-3 transition-all
                          ${
                            isSelected
                              ? `${cat.color} translate-x-1 translate-y-1 shadow-none`
                              : "bg-white shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000]"
                          }
                        `}
                      >
                        <div className="bg-black text-white p-1 rounded-sm">
                          <Icon size={20} />
                        </div>
                        <div className="text-left leading-none">
                          <div className="font-black text-lg uppercase">
                            {cat.label}
                          </div>
                          <div className="text-xs font-bold opacity-70">
                            {cat.sub}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-0 right-0 bg-black text-white text-xs font-bold px-1">
                            PICKED
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* 3. IMPACT: 彈匣填裝 */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xl font-black italic">
                    BOUNTY LEVEL
                  </label>
                  <span className="font-mono font-bold text-xl">
                    {impact * 20}%
                  </span>
                </div>
                <div className="flex justify-between bg-gray-200 border-4 border-black p-2 h-16 items-center relative">
                  {/* 彈孔背景 */}
                  <div className="absolute inset-0 flex justify-around items-center opacity-10 pointer-events-none">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-black" />
                    ))}
                  </div>

                  {[1, 2, 3, 4, 5].map((level) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() => setImpact(level)}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.8 }}
                      className="z-10 relative focus:outline-none"
                    >
                      {/* 子彈造型 */}
                      <div
                        className={`
                        w-8 h-10 border-2 border-black rounded-t-full transition-all duration-200
                        ${
                          impact >= level
                            ? "bg-yellow-400 translate-y-0 shadow-[2px_2px_0px_0px_#000]"
                            : "bg-gray-400 translate-y-2"
                        }
                      `}
                      />
                      {/* 彈殼底部 */}
                      <div className="w-10 h-3 bg-black -ml-1" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <motion.button
                disabled={!isValid || isSubmitting}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className={`
                  w-full py-5 text-3xl font-black italic tracking-tighter border-4 border-black uppercase relative overflow-hidden
                  ${
                    isValid
                      ? "bg-red-600 text-white shadow-[6px_6px_0px_0px_#000] cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? "SENDING..." : "ORDER UP!"}{" "}
                  <Coffee size={32} />
                </div>
                {/* 按鈕內的斜線裝飾 */}
                {isValid && !isSubmitting && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-[length:20px_20px]" />
                )}
              </motion.button>
            </form>

            {/* SPACER separating Form and History */}
            <div className="h-12 flex items-center justify-center opacity-20">
              <div className="w-2 h-2 rounded-full bg-black mx-2" />
              <div className="w-2 h-2 rounded-full bg-black mx-2" />
              <div className="w-2 h-2 rounded-full bg-black mx-2" />
            </div>

            {/* Recent Wins Minimal Display */}
             {recentWins.length > 0 && (
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] relative">
                 <div className="absolute -top-3 -left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rotate-[-5deg] border-2 border-black">
                    HISTORY
                 </div>
                 <h3 className="font-black text-xl italic mb-2 border-b-2 border-black inline-block">PAST MISSIONS</h3>
                 <div className="space-y-2">
                    {recentWins.slice(0, 3).map((win) => (
                      <div key={win.id} className="flex justify-between items-center text-sm font-bold">
                         <span className="truncate flex-1 pr-2">- {win.content}</span>
                         <span className="text-red-600 whitespace-nowrap">{win.category}</span>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* WEEKLY REPORT BUTTON */}
            <motion.button
              type="button"
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 w-full bg-yellow-400 border-4 border-black p-4 font-black text-xl shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-6 h-6" />
              {isGeneratingReport ? "GENERATING..." : "GENERATE WEEKLY REPORT"}
            </motion.button>

            {/* FOOTER */}
            <footer className="mt-12 mb-6 text-center opacity-60">
              <div className="inline-block border-b-2 border-black pb-1 mb-2 font-black text-xs tracking-[0.2em]">
                HYPEMEUP SYSTEM
              </div>
              <p className="text-[10px] font-bold uppercase">
                © YING 2025 . MAKE EVERY DAY A MISSION
              </p>
            </footer>
            
          </motion.div>
        ) : (
          // SUCCESS SCREEN: 購物收據風格
          <motion.div
            key="success"
            className="relative z-10 w-full max-w-md"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {isSubmitting && <SpeedLines />}

            {/* 巨大文字特效 */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute -top-20 -left-10 text-7xl font-black text-red-600 z-30 drop-shadow-[4px_4px_0px_#000] stroke-black"
              style={{
                textShadow: "4px 4px 0 #000",
                WebkitTextStroke: "2px black",
              }}
            >
              CLEAR!
            </motion.div>

            {/* 收據單 */}
            <div className="bg-white w-full border-none shadow-[0_10px_40px_rgba(0,0,0,0.2)] relative overflow-hidden">
              {/* 鋸齒邊緣 */}
              <div className="absolute top-0 left-0 w-full h-4 bg-[linear-gradient(45deg,transparent_33.333%,#fff_33.333%,#fff_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#fff_33.333%,#fff_66.667%,transparent_66.667%)] bg-[length:20px_40px] -mt-2 rotate-180"></div>

              <div className="p-8 pt-10 font-mono text-sm">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-widest">
                    SAKAMOTO
                    <br />
                    STORE
                  </h2>
                  <p className="text-xs">TOKYO, NERIMA, 1-2-3</p>
                  <p className="text-xs">TEL: 03-XXXX-XXXX</p>
                </div>

                <div className="border-t-2 border-dashed border-black my-4" />

                <div className="flex justify-between mb-2">
                  <span>DATE</span>
                  <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span>TIME</span>
                  <span suppressHydrationWarning>{new Date().toLocaleTimeString()}</span>
                </div>

                <div className="mb-2 font-bold flex justify-between">
                  <span>ITEM: {category.toUpperCase()}</span>
                  <span>x1</span>
                </div>
                <p className="mb-4 text-gray-600 leading-relaxed uppercase">
                  "{input}"
                </p>

                <div className="border-t-2 border-black my-4" />

                <div className="flex justify-between text-xl font-black">
                  <span>IMPACT</span>
                  <div className="flex">
                    {[...Array(impact)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <div className="inline-block border-4 border-black p-2 font-black text-xl rotate-3">
                    PAID
                  </div>
                  <p className="mt-4 text-xs font-bold">
                    THANK YOU FOR YOUR HARD WORK!
                  </p>
                  <div className="mt-4 h-12 w-full bg-black/10 flex items-center justify-center">
                    {/* 假條碼 */}
                    <div className="h-8 w-4/5 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px)]" />
                  </div>
                </div>
              </div>

              {/* 底部鋸齒 */}
              <div className="absolute bottom-0 left-0 w-full h-4 bg-[linear-gradient(45deg,transparent_33.333%,#fff_33.333%,#fff_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#fff_33.333%,#fff_66.667%,transparent_66.667%)] bg-[length:20px_40px] -mb-2"></div>
            </div>

            <button
              onClick={handleReset}
              className="mt-8 w-full py-4 bg-black text-white font-black text-xl uppercase hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
            >
              Next Customer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
