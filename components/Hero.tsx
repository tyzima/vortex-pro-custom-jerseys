
import React from 'react';
import { ArrowRight, CheckCircle2, Calendar, Zap } from 'lucide-react';

export const Hero = ({ onStart }: { onStart: () => void }) => {
  // Calculate date 3 weeks (21 days) from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 21);

  const formattedDate = deliveryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-black">
      {/* Video/Image Background Placeholder */}
      <div className="absolute inset-0 z-0 animate-scale-in" style={{ animationDuration: '2s' }}>
        <img
          src="https://images.unsplash.com/photo-1544698310-74ea9d188c1b?q=80&w=2940&auto=format&fit=crop"
          alt="Basketball Texture"
          className="w-full h-full object-cover opacity-40 grayscale mix-blend-luminosity"
        />
        {/* Gradient Overlays for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-brand-black opacity-80" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center md:text-left">
        <div className="max-w-4xl mt-12">
          {/* Main Heading - Slower, smoother entrance */}
          <h1 className="font-display text-7xl md:text-[10rem] text-brand-white uppercase leading-[0.85] italic mb-10 drop-shadow-2xl animate-fade-in-up opacity-0 pr-4" style={{ animationDelay: '200ms', animationDuration: '1s' }}>
            Elevate <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-white to-neutral-500 pr-8">Your Game</span>
          </h1>

          {/* Live Production Status Block - Refined Pill Shape */}
          <div className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationDuration: '1s' }}>
            <div className="inline-flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-brand-gray/60 border border-brand-border p-2 pl-4 pr-6 rounded-full backdrop-blur-xl shadow-2xl">

              {/* Estimated Delivery */}
              <div className="flex items-center gap-2 border-b md:border-b-0 md:border-r border-brand-border pb-2 md:pb-0 md:pr-6">
                <Calendar className="text-neutral-400" size={16} />
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Est. Delivery: <span className="text-brand-white ml-1 font-mono">{formattedDate}</span></span>
              </div>

              {/* Specs */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 text-left">
                <div className="flex items-center gap-2 group">
                  {/* Glowing Pulse Wrapper for Lightning Bolt */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-brand-accent/60 blur-[8px] rounded-full animate-pulse"></div>
                    <Zap size={16} className="text-brand-accent relative z-10 fill-current" />
                  </div>
                  <span className="text-xs font-bold text-brand-white uppercase tracking-wider group-hover:text-brand-accent transition-colors">10-Day Turnaround</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-neutral-500" />
                  <span className="text-xs font-bold text-brand-white uppercase tracking-wider">Pro-Grade Quality</span>
                </div>
              </div>

            </div>
          </div>

          {/* CTA Buttons - Professional Pill Shapes */}
          <div className="flex flex-col md:flex-row gap-6 animate-fade-in-up opacity-0" style={{ animationDelay: '600ms', animationDuration: '1s' }}>
            <button
              onClick={onStart}
              className="group relative bg-brand-accent text-brand-black px-10 py-5 rounded-full font-bold text-lg uppercase tracking-widest hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(210,248,2,0.2)] hover:shadow-[0_0_50px_rgba(210,248,2,0.5)] overflow-hidden"
            >
              <span className="relative z-10">Start Designing</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} strokeWidth={2.5} />

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
            </button>

            <button className="group px-10 py-5 rounded-full font-bold text-lg uppercase tracking-widest text-brand-white border border-brand-border bg-brand-white/5 backdrop-blur-md hover:bg-brand-white/10 hover:border-brand-white/10 transition-all duration-300 flex items-center justify-center gap-3">
              <span>View Gallery</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-0 right-0 hidden lg:block w-1/3 h-full pointer-events-none">
        {/* Abstract Jersey Shape or Graphic can go here */}
      </div>
    </div>
  );
};
