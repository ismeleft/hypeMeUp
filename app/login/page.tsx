
"use client"

import { signIn } from "next-auth/react"
import { ShieldAlert } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
      
      {/* Background Decor - Speech Bubbles / Manga Speed Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: "radial-gradient(circle, #000 2px, transparent 2.5px)",
             backgroundSize: "24px 24px"
           }}
      />
      
      <div className="relative z-10 w-full max-w-md bg-white border-8 border-black shadow-[16px_16px_0px_0px_#000] p-8 text-center rotate-1 transform hover:rotate-0 transition-transform duration-300">
        
        {/* Header Icon */}
        <div className="flex justify-center -mt-16 mb-6">
           <div className="bg-red-600 text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] rotate-[-5deg]">
              <ShieldAlert size={48} />
           </div>
        </div>

        <h1 className="text-6xl font-black italic tracking-tighter mb-2 leading-[0.85]">
          LOGIN
          <br />
          <span className="text-outline-black text-transparent" style={{ WebkitTextStroke: "2px black" }}>REQUIRED</span>
        </h1>
        
        <p className="font-bold text-xl mb-8 uppercase tracking-widest bg-black text-white inline-block px-2">
          // Identify Yourself
        </p>

        <div className="w-full">
          <button 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full bg-black text-white text-2xl font-black py-4 border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all duration-200 shadow-[8px_8px_0px_0px_#666] hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none flex items-center justify-center gap-3"
          >
            <span>SIGN IN WITH GOOGLE</span>
          </button>
        </div>

        <div className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
           System Restricted Area
           <br/>
           Authorized Personnel Only
        </div>
      </div>
      
      {/* Background Manga Sound Effect */}
      <div className="absolute bottom-5 right-5 text-9xl font-black text-black opacity-10 select-none pointer-events-none rotate-[-15deg]">
        ゴゴ
      </div>
    </div>
  )
}
