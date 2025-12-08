
import React from 'react';
import { TrendingDown, Tag, Printer, ArrowRight, Users, Package } from 'lucide-react';

export const Tournaments = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

            {/* 1. PARTNER PITCH (Left Column) */}
            <div className="lg:col-span-1 bg-brand-accent border border-brand-accent rounded-3xl p-8 flex flex-col relative overflow-hidden">
                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="inline-block bg-black text-brand-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                            For Organizers
                        </div>
                        <h3 className="font-display text-5xl uppercase italic text-black mb-6 leading-[0.9]">
                            Elevate Your<br />Tournament<br />Brand
                        </h3>
                        <p className="text-black font-medium leading-relaxed mb-8">
                            Stop settling for generic cotton tees. Arrix outfits your entire tournament with pro-grade sublimated jerseys at wholesale pricing.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-black/5 rounded-xl border border-black/5">
                            <Users className="text-black" size={24} />
                            <div>
                                <div className="text-xs font-bold uppercase opacity-60">Capacity</div>
                                <div className="font-bold text-lg text-black">500 - 5,000+ Players</div>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-black text-white uppercase text-sm font-bold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 group">
                            Become a Partner <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. BENEFITS GRID (Middle & Right) */}
            <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Top Row: Bulk Pricing & Speed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Volume Pricing */}
                    <div className="bg-brand-card border border-brand-border p-8 rounded-3xl hover:border-brand-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:text-black transition-colors">
                            <TrendingDown size={24} />
                        </div>
                        <h4 className="font-display text-3xl text-brand-white uppercase italic mb-2">Tiered Pricing</h4>
                        <p className="text-brand-secondary text-sm mb-6">Deep discounts for bulk orders. The more teams you outfit, the more you save.</p>

                        {/* Simple Bar Chart Visual */}
                        <div className="flex items-end gap-2 h-24 opacity-50">
                            <div className="flex-1 bg-brand-border rounded-t-sm h-[80%] relative group-hover:bg-neutral-600 transition-colors">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px]">$45</span>
                            </div>
                            <div className="flex-1 bg-brand-border rounded-t-sm h-[60%] relative group-hover:bg-neutral-600 transition-colors">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px]">$35</span>
                            </div>
                            <div className="flex-1 bg-brand-accent rounded-t-sm h-[40%] relative">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-brand-accent font-bold">$25</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase text-brand-secondary mt-2 font-bold">
                            <span>10+</span>
                            <span>50+</span>
                            <span>200+</span>
                        </div>
                    </div>

                    {/* Merch Stand */}
                    <div className="bg-brand-card border border-brand-border p-8 rounded-3xl hover:border-brand-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:text-black transition-colors">
                            <Printer size={24} />
                        </div>
                        <h4 className="font-display text-3xl text-brand-white uppercase italic mb-2">On-Site Merch</h4>
                        <p className="text-brand-secondary text-sm mb-6">We set up a pop-up customization lab at your event. Players get names/numbers printed instantly.</p>

                        <div className="bg-brand-black rounded-xl p-4 border border-brand-border flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-gray rounded flex items-center justify-center text-brand-secondary">
                                <Tag size={20} />
                            </div>
                            <div>
                                <div className="text-brand-white font-bold text-sm">Revenue Share</div>
                                <div className="text-brand-accent text-xs uppercase font-bold">Earn 20% on all sales</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Outfit The Bracket */}
                <div className="flex-1 bg-brand-card border border-brand-border p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-brand-white/20 transition-colors">
                    <div className="max-w-sm">
                        <h4 className="font-display text-3xl text-brand-white uppercase italic mb-2">Outfit The Bracket</h4>
                        <p className="text-brand-secondary text-sm">Provide every team with a unique pro-cut jersey included in their registration fee. We handle the logistics, sizing, and shipping.</p>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center gap-2 text-xs text-brand-secondary font-bold uppercase">
                                <Package size={14} className="text-brand-accent" /> Individually Bagged by Team
                            </li>
                            <li className="flex items-center gap-2 text-xs text-brand-secondary font-bold uppercase">
                                <Package size={14} className="text-brand-accent" /> Sorted by Division
                            </li>
                        </ul>
                    </div>

                    {/* Stack of Jerseys Visual */}
                    <div className="relative w-48 h-32 md:h-full flex items-center justify-center perspective-1000">
                        <div className="w-32 h-40 bg-brand-gray rounded border border-brand-border absolute top-0 left-0 transform -rotate-6 group-hover:-rotate-12 transition-transform duration-500 shadow-xl"></div>
                        <div className="w-32 h-40 bg-brand-border rounded border border-brand-border absolute top-2 left-4 transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500 shadow-xl"></div>
                        <div className="w-32 h-40 bg-brand-accent rounded border border-brand-white/20 absolute top-4 left-8 transform rotate-0 group-hover:rotate-3 transition-transform duration-500 shadow-2xl flex items-center justify-center">
                            <span className="font-display text-4xl text-black italic">V</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
