
import React from 'react';

export const MoistureWicking = () => {
  return (
    <div className="w-full h-full bg-neutral-950 rounded-xl border border-neutral-800 relative overflow-hidden group shadow-2xl">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      
      <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
        <defs>
           <linearGradient id="fiber-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#262626"/>
              <stop offset="50%" stopColor="#404040"/>
              <stop offset="100%" stopColor="#262626"/>
           </linearGradient>
           <filter id="glow-blue">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
              </feMerge>
           </filter>
        </defs>

        <style>
          {`
            @keyframes channelFlow {
              0% { transform: translateY(160px); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(-40px); opacity: 0; }
            }
            .moisture-dot { animation: channelFlow 2.5s infinite linear; }
          `}
        </style>

        {/* 1. SKIN SURFACE (Bottom Line) */}
        <line x1="0" y1="180" x2="600" y2="180" stroke="#555" strokeWidth="1" />
        <rect x="0" y="180" width="600" height="20" fill="#1a1a1a" />
        <text x="20" y="192" fill="#666" fontSize="9" fontWeight="bold" className="uppercase tracking-widest">Skin Layer</text>

        {/* 2. FABRIC ARCHITECTURE (Geometric Fibers) */}
        <g transform="translate(0, 60)">
            {/* Fiber Strands - Repeated pattern */}
            {[...Array(12)].map((_, i) => (
                <g key={i} transform={`translate(${i * 50}, 0)`}>
                    {/* Vertical Channel Walls */}
                    <rect x="15" y="0" width="4" height="120" fill="url(#fiber-gradient)" opacity="0.8" />
                    <rect x="35" y="0" width="4" height="120" fill="url(#fiber-gradient)" opacity="0.8" />
                    
                    {/* Cross-links */}
                    <rect x="19" y="30" width="16" height="2" fill="#333" />
                    <rect x="19" y="60" width="16" height="2" fill="#333" />
                    <rect x="19" y="90" width="16" height="2" fill="#333" />
                </g>
            ))}
        </g>

        {/* 3. MOISTURE PARTICLES (Animated) */}
        <g filter="url(#glow-blue)">
            {[...Array(15)].map((_, i) => {
                // Position dots inside the channels between fibers
                const channel = Math.floor(Math.random() * 12);
                const xBase = channel * 50 + 27; // Center of channel
                const delay = Math.random() * 2.5;
                return (
                    <circle 
                        key={i} 
                        cx={xBase} 
                        cy="0" 
                        r="2.5" 
                        fill="#38bdf8" 
                        className="moisture-dot"
                        style={{ animationDelay: `${delay}s` }}
                    />
                );
            })}
        </g>

        {/* 4. EVAPORATION ZONE (Top) */}
        <g transform="translate(0, 40)">
             <text x="20" y="0" fill="#D2F802" fontSize="9" fontWeight="bold" className="uppercase tracking-widest">Atmosphere / Evaporation</text>
             {/* Upward Arrows */}
             {[100, 250, 400, 550].map((x, i) => (
                 <path 
                    key={i}
                    d={`M${x} 30 L${x} 10`} 
                    stroke="#D2F802" 
                    strokeWidth="1" 
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                 />
             ))}
             {/* Arrowhead def inline */}
             <defs>
                 <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
                     <path d="M0 0 L6 3 L0 6 Z" fill="#D2F802" />
                 </marker>
             </defs>
        </g>

        {/* 5. Technical Labels with Leader Lines */}
        <g opacity="0.7">
            {/* To Channel */}
            <line x1="425" y1="100" x2="480" y2="100" stroke="#666" strokeWidth="1" />
            <text x="490" y="103" fill="#888" fontSize="8" className="uppercase font-mono">Hydrophobic Channel</text>
            
            {/* To Particle */}
            <line x1="277" y1="140" x2="320" y2="140" stroke="#38bdf8" strokeWidth="1" />
            <text x="330" y="143" fill="#38bdf8" fontSize="8" className="uppercase font-mono">H₂O Molecule</text>
        </g>

      </svg>
    </div>
  );
};
