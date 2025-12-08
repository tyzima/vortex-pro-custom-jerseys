
import React from 'react';

export const TrustBar = () => {
  // Placeholder logos using text/svg
  const PartnerLogo = ({ label }: { label: string }) => (
    <div className="grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default">
      <h3 className="font-display text-2xl italic uppercase">{label}</h3>
    </div>
  );

  return (
    <div className="bg-brand-black border-b border-brand-border py-8 overflow-hidden">
      <div className="container mx-auto px-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-6">Trusted by 500+ Leagues & Organizations</p>

        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-16">
          <PartnerLogo label="Elite Circuit" />
          <PartnerLogo label="Varsity Pro" />
          <PartnerLogo label="AAU National" />
          <PartnerLogo label="Prep Hoops" />
          <PartnerLogo label="Next Gen" />
          <PartnerLogo label="Top Tier" />
        </div>
      </div>
    </div>
  );
};
