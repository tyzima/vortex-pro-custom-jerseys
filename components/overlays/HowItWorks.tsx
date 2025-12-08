
import React from 'react';
import { PenTool, Settings, Package, Barcode, MousePointer, Printer, Scissors, Shirt, Star, HelpCircle, ArrowRight, Thermometer, Timer, Gauge, Type, Image, Layers } from 'lucide-react';

interface HowItWorksProps {
  onContactClick?: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onContactClick }) => {
  return (
    <div className="space-y-24 pb-12">

      {/* SECTION 1: THE PROCESS (3-STEP GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* STEP 1: DESIGN */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col group hover:border-brand-accent/50 transition-colors relative overflow-hidden">
          <div className="relative z-10 flex flex-col">
            <div className="w-12 h-12 bg-brand-gray rounded-xl flex items-center justify-center mb-6 text-brand-white group-hover:bg-brand-accent group-hover:text-black transition-colors">
              <PenTool size={24} />
            </div>
            <h3 className="font-display text-3xl uppercase italic text-brand-white mb-4">01. Design</h3>
            <p className="text-brand-secondary text-sm leading-relaxed mb-8">
              Use our real-time builder to customize every inch. Select your cut, choose patterns, and roster your team.
            </p>

            {/* VISUAL: The Builder Interface */}
            <div className="mt-8 w-full aspect-[4/3] bg-brand-black rounded-xl border border-brand-border relative overflow-hidden shadow-2xl flex flex-col group-hover:border-brand-accent/30 transition-colors">
              {/* Mock Browser Header */}
              <div className="h-8 bg-brand-gray border-b border-brand-border flex items-center justify-between px-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                </div>
                <div className="bg-black/20 px-3 py-1 rounded text-[8px] font-mono text-brand-secondary">vortex_customizer_v2.1.app</div>
                <div className="w-10"></div>
              </div>

              <div className="flex-1 flex relative">
                {/* Left Toolbar */}
                <div className="w-10 border-r border-brand-border bg-brand-gray/30 flex flex-col items-center py-3 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${i === 1 ? 'bg-brand-accent text-black' : 'text-brand-secondary hover:bg-brand-white/10'}`}>
                      {i === 0 && <Shirt size={12} />}
                      {i === 1 && <PenTool size={12} />}
                      {i === 2 && <Type size={12} />}
                      {i === 3 && <Image size={12} />}
                      {i === 4 && <Layers size={12} />}
                    </div>
                  ))}
                </div>

                {/* Main Canvas */}
                <div className="flex-1 bg-[#111] relative overflow-hidden flex items-center justify-center">
                  {/* Grid Background */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                  {/* Jersey Wireframe */}
                  {/* Jersey Wireframe */}
                  <div className="relative w-32 h-32 flex items-center justify-center transform transition-transform duration-700 group-hover:scale-105">
                    <Shirt size={100} strokeWidth={1} className="text-neutral-700 drop-shadow-2xl" />

                    {/* Animated Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Shirt size={100} strokeWidth={1} className="text-brand-accent drop-shadow-[0_0_15px_rgba(210,248,2,0.3)]" fill="rgba(210,248,2,0.1)" />
                    </div>

                    {/* Number */}
                    <div className="absolute inset-0 flex items-center justify-center pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                      <span className="font-display text-2xl font-bold text-brand-white">01</span>
                    </div>
                  </div>

                  {/* Floating UI Panels */}
                  <div className="absolute top-4 right-4 w-24 bg-brand-gray/90 backdrop-blur border border-brand-border rounded-lg p-2 shadow-lg transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-300">
                    <div className="text-[8px] font-bold text-brand-secondary uppercase mb-1.5">Colors</div>
                    <div className="grid grid-cols-4 gap-1">
                      <div className="w-4 h-4 rounded-full bg-brand-accent border border-white/20"></div>
                      <div className="w-4 h-4 rounded-full bg-white border border-white/20"></div>
                      <div className="w-4 h-4 rounded-full bg-black border border-white/20"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-500 border border-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: PRODUCTION */}
        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 flex flex-col group hover:border-brand-accent/50 transition-colors relative overflow-hidden">
          <div className="relative z-10 flex flex-col">
            <div className="w-12 h-12 bg-brand-gray rounded-xl flex items-center justify-center mb-6 text-brand-white group-hover:bg-brand-accent group-hover:text-black transition-colors">
              <Settings size={24} />
            </div>
            <h3 className="font-display text-3xl uppercase italic text-brand-white mb-4">02. Production</h3>
            <p className="text-brand-secondary text-sm leading-relaxed mb-8">
              Your order is routed instantly to our factory. We dye-sublimate, cut, and sew your gear in under 7 days.
            </p>

            {/* VISUAL: Production Dashboard */}
            <div className="mt-8 w-full aspect-[4/3] bg-brand-black rounded-xl border border-brand-border relative overflow-hidden shadow-2xl flex flex-col">
              {/* Status Bar */}
              <div className="h-8 border-b border-brand-border bg-brand-gray/20 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[8px] font-mono text-green-500 uppercase tracking-wider">System Online</span>
                </div>
                <div className="text-[8px] font-mono text-brand-secondary">JOB-ID: #8842-X</div>
              </div>

              <div className="flex-1 relative flex">
                {/* Main Viewport */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                  {/* Scanning Grid */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(210, 248, 2, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(210, 248, 2, 0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: 'perspective(500px) rotateX(60deg) translateY(-50px) scale(2)'
                  }}></div>

                  {/* The Print Head Animation */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent/50 shadow-[0_0_15px_rgba(210,248,2,0.5)] animate-[scan_3s_ease-in-out_infinite]"></div>

                  {/* Jersey being printed */}
                  <div className="relative z-10 opacity-80 w-32 h-32 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {/* Base Outline */}
                      <Shirt size={80} strokeWidth={1} className="text-neutral-700 absolute" />

                      {/* Revealing Layer */}
                      <div className="absolute inset-0 flex items-center justify-center animate-[revealHeight_3s_ease-in-out_infinite] overflow-hidden" style={{ clipPath: 'inset(0 0 100% 0)' }}>
                        <Shirt size={80} strokeWidth={1} className="text-brand-accent" fill="rgba(210,248,2,0.2)" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Data Panel */}
                <div className="w-24 border-l border-brand-border bg-brand-gray/10 p-3 flex flex-col gap-4">
                  <div>
                    <div className="text-[6px] uppercase text-brand-secondary mb-1">Ink Levels</div>
                    <div className="flex gap-0.5 h-16 items-end">
                      <div className="w-1.5 bg-cyan-500 h-[80%] rounded-t-sm"></div>
                      <div className="w-1.5 bg-magenta-500 h-[60%] rounded-t-sm"></div>
                      <div className="w-1.5 bg-yellow-500 h-[90%] rounded-t-sm"></div>
                      <div className="w-1.5 bg-black h-[75%] rounded-t-sm"></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[6px] uppercase text-brand-secondary mb-1">Temp</div>
                    <div className="text-xs font-mono text-brand-white">385°</div>
                  </div>
                </div>
              </div>

              <style>{`
                    @keyframes scan {
                        0%, 100% { top: 0%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; }
                    }
                    @keyframes revealHeight {
                        0% { height: 0; }
                        100% { height: 120px; }
                    }
                  `}</style>
            </div>
          </div>
        </div>

        {/* STEP 3: DELIVERY */}
        <div className="bg-brand-accent border border-brand-accent rounded-3xl p-8 flex flex-col relative overflow-hidden group">
          <div className="relative z-10 flex flex-col">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 text-brand-accent">
              <Package size={24} />
            </div>
            <h3 className="font-display text-3xl uppercase italic text-black mb-4">03. Pro Delivery</h3>
            <p className="text-neutral-900 font-medium text-sm leading-relaxed mb-8">
              We don't just throw jerseys in a box. Every player's gear is sorted, folded, and individually poly-bagged with custom ID labels.
            </p>

            {/* VISUAL: Logistics & QC */}
            <div className="mt-8 w-full aspect-[4/3] bg-brand-black rounded-xl border border-brand-border relative overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Map Background */}
              <div className="absolute inset-0 opacity-30 grayscale" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="absolute inset-0 bg-brand-black/80"></div>

              {/* Tracking Line */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-0.5 bg-brand-border relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(210,248,2,0.5)]"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-border"></div>
                  {/* Moving Dot */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-1.5 rounded-full bg-brand-white shadow-lg animate-[moveRight_2s_ease-in-out_infinite]"></div>
                </div>
              </div>

              {/* Package Card */}
              <div className="relative z-10 bg-brand-card border border-brand-border p-4 rounded-xl shadow-2xl w-48 transform transition-transform duration-500 group-hover:-translate-y-2">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 bg-brand-accent/10 rounded flex items-center justify-center text-brand-accent">
                    <Package size={16} />
                  </div>
                  <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Shipped</div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-24 bg-brand-gray rounded-full"></div>
                  <div className="h-1.5 w-16 bg-brand-gray rounded-full"></div>
                </div>
                <div className="mt-4 pt-3 border-t border-brand-border flex justify-between items-center">
                  <div className="text-[8px] text-brand-secondary font-mono">TRK: 1Z99X...</div>
                  <Barcode size={12} className="text-brand-secondary opacity-50" />
                </div>

                {/* QC Stamp */}
                <div className="absolute -right-2 -bottom-2 w-12 h-12 border-2 border-brand-accent rounded-full flex items-center justify-center transform -rotate-12 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 bg-brand-black/90">
                  <span className="text-[8px] font-bold text-brand-accent uppercase">QC PASS</span>
                </div>
              </div>

              <style>{`
                    @keyframes moveRight {
                        0% { left: 0; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { left: 100%; opacity: 0; }
                    }
                `}</style>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: TESTIMONIALS */}
      <div className="pt-12 border-t border-brand-border">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl uppercase italic text-brand-white mb-4">Trusted by Elite Programs</h2>
          <p className="text-brand-secondary">From AAU circuits to professional leagues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-brand-card border border-brand-border p-8 rounded-2xl relative">
            <div className="flex gap-1 mb-4 text-brand-accent">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-brand-secondary mb-6 text-sm leading-relaxed">"We needed 200 kits for our summer tournament in under 2 weeks. Arrix didn't just meet the deadline, the quality blew the parents away."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gray border border-brand-border flex items-center justify-center font-bold text-brand-secondary">JD</div>
              <div>
                <div className="text-brand-white font-bold text-sm">Jason Davis</div>
                <div className="text-brand-secondary text-xs uppercase">Director, West Coast Elite</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-brand-card border border-brand-border p-8 rounded-2xl relative">
            <div className="flex gap-1 mb-4 text-brand-accent">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-brand-secondary mb-6 text-sm leading-relaxed">"The poly-bagging system is a game changer. Handing out jerseys took 10 minutes instead of 2 hours of sorting through a cardboard box."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gray border border-brand-border flex items-center justify-center font-bold text-brand-secondary">MR</div>
              <div>
                <div className="text-brand-white font-bold text-sm">Marcus Reed</div>
                <div className="text-brand-secondary text-xs uppercase">Head Coach, North High</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-brand-card border border-brand-border p-8 rounded-2xl relative">
            <div className="flex gap-1 mb-4 text-brand-accent">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <p className="text-brand-secondary mb-6 text-sm leading-relaxed">"The customizer allowed our players to vote on the design. The final product looked exactly like the mockups. Zero surprises."</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gray border border-brand-border flex items-center justify-center font-bold text-brand-secondary">SL</div>
              <div>
                <div className="text-brand-white font-bold text-sm">Sarah Lewis</div>
                <div className="text-brand-secondary text-xs uppercase">Club Manager, FC United</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: FAQ */}
      <div className="pt-12 border-t border-brand-border grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="inline-flex items-center gap-2 text-brand-accent mb-4">
            <HelpCircle size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Support Center</span>
          </div>
          <h2 className="font-display text-4xl uppercase italic text-brand-white mb-6">Common Questions</h2>
          <p className="text-brand-secondary text-sm mb-8">Can't find what you're looking for? Chat with our design team.</p>
          <button
            onClick={onContactClick}
            className="px-6 py-3 bg-brand-white text-brand-black font-bold uppercase tracking-widest text-xs rounded hover:bg-brand-accent transition-colors flex items-center gap-2"
          >
            Contact Us <ArrowRight size={14} />
          </button>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">What is the turnaround time?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">Standard production is 10 business days from artwork approval. Rush options (5-7 days) are available for an additional fee.</p>
          </div>
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">Is there a minimum order?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">Our standard minimum is 10 units per design. For fill-in orders (adding 1-2 players later), the minimum is waived.</p>
          </div>
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">Do you ship internationally?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">Yes, we ship globally via DHL Express. International shipping typically adds 3-5 days to the delivery timeline.</p>
          </div>
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">Can I see a physical sample?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">Absolutely. You can order a blank sample kit to test sizing and fabric quality before placing your full team order.</p>
          </div>
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">Is logo design free?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">Yes! Our art team will help convert your sketch or low-res logo into a production-ready vector format at no extra cost.</p>
          </div>
          <div>
            <h4 className="text-brand-white font-bold uppercase mb-2">What format do I need for logos?</h4>
            <p className="text-brand-secondary text-sm leading-relaxed">We prefer vector files (AI, EPS, PDF, SVG). If you only have a PNG or JPEG, ensure it is at least 300 DPI.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
