
import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        quote: "We switched from Nike for our travel program and haven't looked back. The 10-day turnaround is actually real.",
        author: "Coach Mike T.",
        role: "Director, Bay Area Ballers",
        rating: 5
    },
    {
        quote: "The builder tool made it so easy to get the parents to agree on a design. The final jerseys look incredible in person.",
        author: "Sarah Jenkins",
        role: "Team Manager, Lady Lions",
        rating: 5
    },
    {
        quote: "Best quality mesh we've used. Super light but holds up to contact. Our players love the fit.",
        author: "David Ross",
        role: "Head Coach, Northside High",
        rating: 5
    }
];

export const Testimonials = () => {
    return (
        <div className="bg-brand-gray py-32 relative overflow-hidden text-brand-white">

            {/* Background: Technical Dot Grid (Subtle) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            {/* Background Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gray via-transparent to-brand-gray pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8 border-b border-brand-border pb-12">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex gap-0.5 text-brand-accent bg-brand-white/5 px-2 py-1 rounded-full">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" className="text-brand-accent" />)}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">5.0 Average Rating</span>
                        </div>
                        <h2 className="font-display text-5xl md:text-6xl uppercase italic text-brand-white leading-[0.9] tracking-tight">
                            Trusted by<br />Elite Programs
                        </h2>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-neutral-500 font-medium text-lg">From AAU circuits<br />to professional leagues.</p>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {REVIEWS.map((review, i) => (
                        <div key={i} className="bg-brand-black border border-brand-border p-10 rounded-xl relative group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:bg-brand-black/80">

                            {/* Decorative Quote Mark */}
                            <div className="absolute top-8 right-8 font-serif text-8xl text-brand-white/10 leading-none opacity-50 group-hover:text-brand-accent/20 transition-colors select-none">
                                &rdquo;
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(review.rating)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" className="text-brand-accent" />)}
                                    </div>
                                    <p className="text-brand-white text-lg font-medium leading-relaxed mb-8">
                                        {review.quote}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 pt-6 border-t border-brand-border">
                                    <div className="w-12 h-12 rounded-full bg-brand-white text-brand-black flex items-center justify-center font-bold border-2 border-brand-black shadow-lg">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-brand-white font-bold uppercase text-xs tracking-wider">{review.author}</div>
                                        <div className="text-neutral-500 text-[10px] uppercase font-bold mt-0.5">{review.role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Brand Strip */}
                <div className="mt-24 flex justify-center opacity-20 grayscale hover:grayscale-0 transition-all duration-700">

                </div>

            </div>
        </div>
    );
};
