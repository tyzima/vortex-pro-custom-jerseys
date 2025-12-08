
import React from 'react';
import { Truck, Calendar, CheckCircle2 } from 'lucide-react';

export const DeliveryBar = () => {
  // Calculate date 3 weeks (21 days) from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 21);
  
  const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="w-full bg-neutral-950 border-y border-neutral-900 py-8 relative z-20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-xs uppercase tracking-widest text-neutral-500 font-medium">
            
            {/* Status Indicator */}
            <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </div>
                <span className="font-bold text-neutral-300">Production: <span className="text-green-500 ml-1">Online</span></span>
            </div>

            <div className="hidden md:block w-px h-6 bg-neutral-800"></div>

            {/* Delivery Estimate */}
            <div className="flex items-center gap-3">
                <Calendar size={14} className="text-brand-accent" />
                <span>Est. Delivery: <span className="text-white font-bold ml-1 border-b border-brand-accent/30 pb-0.5">{formattedDate}</span></span>
            </div>

             <div className="hidden md:block w-px h-6 bg-neutral-800"></div>

            {/* Turnaround */}
             <div className="flex items-center gap-3">
                <Truck size={14} className="text-brand-accent" />
                <span>Turnaround: <span className="text-white font-bold ml-1">10-14 Days</span></span>
            </div>

        </div>
      </div>
    </div>
  );
};
