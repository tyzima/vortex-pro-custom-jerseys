
import React from 'react';
import { Check, ArrowRight, Shirt, ShoppingBag } from 'lucide-react';

export const TeamPacks = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-auto md:grid-rows-2 gap-6 h-full min-h-[800px]">

            {/* 1. STARTER PACK (Large Left) */}
            <div className="md:col-span-1 md:row-span-2 bg-brand-card border border-brand-border rounded-xl p-8 flex flex-col relative overflow-hidden group hover:border-brand-accent/50 transition-colors">
                <div className="absolute top-0 right-0 bg-brand-gray text-xs font-bold px-3 py-1 rounded-bl-lg text-brand-secondary uppercase tracking-widest">Essentials</div>

                <h3 className="font-display text-5xl uppercase italic text-brand-white mb-2">Starter<br />Pack</h3>
                <p className="text-brand-secondary text-sm mb-8">Everything you need to hit the court. Pro-grade quality, entry-level price.</p>

                <div className="flex-1 flex flex-col items-center justify-center gap-4 my-8 relative">
                    {/* CSS Visual for Jersey */}
                    <div className="w-32 h-40 bg-brand-gray rounded-t-2xl relative border border-brand-border shadow-xl group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-brand-black rounded-b-full border-b border-l border-r border-brand-border"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-brand-secondary font-display text-4xl opacity-20">01</div>
                    </div>
                    {/* CSS Visual for Shorts */}
                    <div className="w-32 h-24 bg-brand-gray rounded-b-xl border border-brand-border shadow-xl -mt-2 group-hover:scale-105 transition-transform duration-500 delay-75"></div>
                </div>

                <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-brand-secondary">
                        <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-black"><Check size={12} strokeWidth={4} /></div>
                        Custom Reversible Jersey
                    </li>
                    <li className="flex items-center gap-3 text-sm text-brand-secondary">
                        <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-black"><Check size={12} strokeWidth={4} /></div>
                        Performance Shorts
                    </li>
                </ul>

                <div className="mt-auto pt-6 border-t border-brand-border">
                    <div className="text-3xl font-bold text-brand-white mb-1">$65<span className="text-sm font-normal text-brand-secondary">/player</span></div>
                    <button className="w-full py-3 bg-brand-white text-brand-black font-bold uppercase tracking-widest text-xs rounded hover:bg-brand-accent transition-colors mt-4">
                        Select Pack
                    </button>
                </div>
            </div>

            {/* 2. PRO PACK (Top Right) */}
            <div className="md:col-span-2 bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between group hover:bg-brand-accent/10 transition-colors">
                <div className="z-10 max-w-md">
                    <div className="inline-block bg-brand-accent text-black text-xs font-bold px-2 py-1 rounded mb-4 uppercase tracking-widest">Best Value</div>
                    <h3 className="font-display text-5xl uppercase italic text-brand-white mb-4">Pro Travel<br />Bundle</h3>
                    <p className="text-brand-secondary mb-6">The complete tournament experience. Add a shooter shirt and warmups to dominate pre-game.</p>
                    <ul className="grid grid-cols-2 gap-3 mb-6">
                        {['Reversible Jersey', 'Performance Shorts', 'Shooter Shirt', 'Warmup Hoodie'].map(i => (
                            <li key={i} className="flex items-center gap-2 text-xs font-bold text-brand-white uppercase">
                                <div className="w-1.5 h-1.5 bg-brand-accent rounded-full" /> {i}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Visual Composition */}
                <div className="relative w-64 h-48 md:w-80 md:h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-accent/20 blur-3xl rounded-full animate-pulse-slow"></div>
                    <div className="relative z-10 grid grid-cols-2 gap-2 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <div className="w-24 h-24 bg-brand-gray border border-brand-border rounded-lg flex items-center justify-center"><Shirt className="text-brand-secondary" /></div>
                        <div className="w-24 h-24 bg-brand-gray border border-brand-border rounded-lg flex items-center justify-center"><div className="w-12 h-8 bg-brand-border rounded-sm" /></div>
                        <div className="w-24 h-24 bg-brand-gray border border-brand-border rounded-lg flex items-center justify-center text-xs font-bold text-brand-secondary">SHOOTER</div>
                        <div className="w-24 h-24 bg-brand-gray border border-brand-border rounded-lg flex items-center justify-center text-xs font-bold text-brand-secondary">HOODIE</div>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 z-10">
                    <div className="text-right">
                        <div className="text-4xl font-bold text-brand-white">$110<span className="text-sm font-normal text-brand-secondary">/player</span></div>
                        <button className="flex items-center gap-2 text-brand-accent font-bold uppercase text-xs mt-2 hover:text-brand-white transition-colors">
                            Customize <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. TEAM GEAR (Bottom Middle) */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex flex-col justify-between hover:border-brand-border transition-colors group">
                <div>
                    <h3 className="font-display text-2xl uppercase italic text-brand-white mb-2">Coaches &<br />Staff</h3>
                    <p className="text-xs text-brand-secondary">Polos, quarter-zips, and hats for the sidelines.</p>
                </div>
                <div className="mt-6 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded bg-brand-gray border border-brand-border" />
                    <div className="w-10 h-10 rounded bg-brand-gray border border-brand-border" />
                    <div className="w-10 h-10 rounded bg-brand-gray border border-brand-border" />
                </div>
            </div>

            {/* 4. ACCESSORIES (Bottom Right) */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 flex items-center justify-between hover:border-brand-border transition-colors group relative overflow-hidden">
                <div className="z-10">
                    <h3 className="font-display text-2xl uppercase italic text-brand-white mb-2">Team<br />Bags</h3>
                    <p className="text-xs text-brand-secondary max-w-[120px]">Custom backpacks and duffels with player numbers.</p>
                </div>
                <ShoppingBag className="text-brand-secondary group-hover:text-brand-accent transition-colors transform group-hover:scale-110 duration-500" size={64} strokeWidth={1} />
            </div>
        </div>
    );
};
