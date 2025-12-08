
import React from 'react';
import { MoistureWicking } from '../diagrams/MoistureWicking';

export const Fabrics = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">

            {/* 1. HERO DIAGRAM (Main Left) */}
            <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="relative z-10 mb-8">
                    <h3 className="font-display text-6xl uppercase italic text-brand-white mb-2">Aero-Lite<span className="text-brand-accent text-2xl not-italic align-top">™</span></h3>
                    <p className="text-xl text-brand-secondary max-w-md">Engineered for zero-distraction. Our proprietary mesh weighs just 140gsm while maintaining pro-level durability.</p>
                </div>

                {/* SVG Diagram: Micro-Structure */}
                <div className="w-full h-64 bg-brand-black border border-brand-border rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-2xl">
                    {/* Base Mesh */}
                    <svg width="100%" height="100%" className="absolute inset-0 opacity-30">
                        <pattern id="hex-mesh" x="0" y="0" width="40" height="68" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
                            <path d="M20 0L40 11V34L20 45L0 34V11z" fill="none" stroke="#D2F802" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#hex-mesh)" />
                    </svg>

                    {/* Zoom Lens Effect */}
                    <div className="w-40 h-40 rounded-full border-2 border-brand-accent bg-brand-gray absolute shadow-[0_0_30px_rgba(210,248,2,0.2)] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-125 duration-700">
                        <svg width="200" height="200" viewBox="0 0 100 100">
                            <pattern id="hex-zoom" x="0" y="0" width="20" height="34" patternUnits="userSpaceOnUse">
                                <path d="M10 0L20 5.5V17L10 22.5L0 17V5.5z" fill="none" stroke="#D2F802" strokeWidth="2" />
                            </pattern>
                            <rect width="100" height="100" fill="url(#hex-zoom)" />
                        </svg>
                        <div className="absolute bottom-4 text-[10px] font-bold uppercase bg-brand-black px-2 text-brand-accent">200x Magnification</div>
                    </div>
                </div>
            </div>

            {/* 2. MOISTURE WICKING (Top Right) */}
            <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col relative group hover:bg-brand-gray/80 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <h4 className="font-bold uppercase tracking-widest text-brand-white">Moisture Wicking</h4>
                    <div className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-1 rounded">DRY-LOCK TECH</div>
                </div>

                {/* DIAGRAM - Compact Height */}
                <div className="w-full h-48">
                    <MoistureWicking />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    {/* 4-Way Stretch (Moved here) */}
                    <div className="bg-brand-black/40 p-3 rounded border border-brand-border flex flex-col items-center text-center group/stretch hover:border-brand-accent/30 transition-colors">
                        <div className="w-8 h-8 mb-2 relative flex items-center justify-center opacity-80 group-hover/stretch:rotate-45 transition-transform duration-500">
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute w-4 h-4 border border-white rounded-[1px]"></div>
                                <div className="absolute top-0.5 w-1 h-1 border-t border-r border-brand-accent rotate-[-45deg] -translate-y-1.5"></div>
                                <div className="absolute bottom-0.5 w-1 h-1 border-b border-l border-brand-accent rotate-[-45deg] translate-y-1.5"></div>
                                <div className="absolute left-0.5 w-1 h-1 border-b border-l border-brand-accent rotate-[45deg] -translate-x-1.5"></div>
                                <div className="absolute right-0.5 w-1 h-1 border-t border-r border-brand-accent rotate-[45deg] translate-x-1.5"></div>
                            </div>
                        </div>
                        <div className="text-[10px] font-bold text-brand-white uppercase mb-1">4-Way Stretch</div>
                        <div className="text-[8px] text-brand-secondary leading-tight">Unrestricted movement</div>
                    </div>

                    {/* Reinforced (Moved here) */}
                    <div className="bg-brand-black/40 p-3 rounded border border-brand-border flex flex-col items-center text-center group/shield hover:border-brand-accent/30 transition-colors">
                        <div className="w-8 h-8 mb-2 relative flex items-center justify-center text-white group-hover/shield:text-brand-accent transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <div className="absolute -right-1 -top-1 w-4 h-4 bg-brand-accent rounded-full flex items-center justify-center text-black text-[8px] font-bold border border-brand-black">50+</div>
                        </div>
                        <div className="text-[10px] font-bold text-brand-white uppercase mb-1">Reinforced</div>
                        <div className="text-[8px] text-brand-secondary leading-tight">Double-stitched seams</div>
                    </div>
                </div>
            </div>

        </div>
    );
};
