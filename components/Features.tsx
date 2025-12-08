import React from 'react';
import { Zap, Shield, Clock, Wind } from 'lucide-react';

const FEATURE_LIST = [
  {
    icon: Zap,
    title: "Ultra-Lite Mesh",
    description: "Proprietary aerospace-grade fabric that is 40% lighter than standard jersey material."
  },
  {
    icon: Wind,
    title: "Moisture Wicking",
    description: "Advanced capillary action pulls sweat away from the body instantly, keeping you dry in overtime."
  },
  {
    icon: Shield,
    title: "Durable Sublimation",
    description: "Ink is fused into the fabric molecule. No peeling, no cracking, no fading. Ever."
  },
  {
    icon: Clock,
    title: "10-Day Turnaround",
    description: "From final approval to your doorstep in record time. We don't miss deadlines."
  }
];

export const Features = () => {
  return (
    <div className="bg-brand-gray py-24 border-t border-brand-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand-accent font-bold tracking-widest uppercase mb-2 block">Pro Advantage</span>
          <h2 className="font-display text-4xl md:text-5xl text-brand-white uppercase italic">Why Top Teams Choose Arrix</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {FEATURE_LIST.map((f, i) => (
            <div key={i} className="group p-8 border border-brand-border bg-brand-black hover:border-brand-accent/50 transition-all duration-300 rounded-lg">
              <f.icon className="text-brand-accent mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold text-brand-white uppercase mb-4 font-sport">{f.title}</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
