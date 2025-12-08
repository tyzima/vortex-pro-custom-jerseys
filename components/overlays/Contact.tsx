
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export const Contact = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">

            {/* LEFT COLUMN: Info & Context */}
            <div className="flex flex-col justify-between h-full space-y-12">
                <div>
                    <h3 className="font-display text-5xl uppercase italic text-brand-white mb-6">Get In Touch</h3>
                    <p className="text-xl text-brand-secondary leading-relaxed max-w-md">
                        Ready to outfit your team? Our design specialists are standing by to help you create something legendary.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-4 p-6 bg-brand-card border border-brand-border rounded-2xl hover:border-brand-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center group-hover:bg-brand-accent group-hover:text-black transition-colors">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-white uppercase mb-1">Sales Inquiries</h4>
                            <p className="text-sm text-brand-secondary mb-2">For bulk orders and team packages.</p>
                            <a href="mailto:sales@vortex.com" className="text-brand-accent hover:text-white transition-colors font-mono text-sm">sales@vortex.com</a>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-brand-card border border-brand-border rounded-2xl hover:border-brand-accent/50 transition-colors group">
                        <div className="w-12 h-12 bg-brand-gray rounded-full flex items-center justify-center group-hover:bg-brand-accent group-hover:text-black transition-colors">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-brand-white uppercase mb-1">Support</h4>
                            <p className="text-sm text-brand-secondary mb-2">Order status and existing accounts.</p>
                            <a href="mailto:help@vortex.com" className="text-brand-accent hover:text-white transition-colors font-mono text-sm">help@vortex.com</a>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-l-2 border-brand-accent pl-6">
                    <p className="text-xs font-bold uppercase text-brand-secondary mb-2">Headquarters</p>
                    <p className="text-brand-white font-bold">Arrix Sports Labs</p>
                    <p className="text-brand-secondary text-sm">2400 Tech Way, Suite 500<br />Portland, OR 97205</p>
                </div>
            </div>

            {/* RIGHT COLUMN: Form */}
            <div className="bg-brand-card border border-brand-border rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
                <h4 className="font-bold text-brand-white uppercase tracking-widest mb-8 pb-4 border-b border-brand-border">Send us a message</h4>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-secondary uppercase">First Name</label>
                            <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-4 text-brand-white focus:border-brand-accent outline-none transition-colors" placeholder="Jordan" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-brand-secondary uppercase">Last Name</label>
                            <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-4 text-brand-white focus:border-brand-accent outline-none transition-colors" placeholder="Poole" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-secondary uppercase">Email Address</label>
                        <input type="email" className="w-full bg-brand-black border border-brand-border rounded p-4 text-brand-white focus:border-brand-accent outline-none transition-colors" placeholder="coach@team.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-secondary uppercase">Team / Organization</label>
                        <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-4 text-brand-white focus:border-brand-accent outline-none transition-colors" placeholder="Westside Warriors" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-brand-secondary uppercase">Message</label>
                        <textarea rows={4} className="w-full bg-brand-black border border-brand-border rounded p-4 text-brand-white focus:border-brand-accent outline-none transition-colors resize-none" placeholder="Tell us about your team's needs..." />
                    </div>

                    <button className="w-full bg-brand-accent hover:bg-white text-black font-bold uppercase tracking-widest py-4 rounded transition-colors flex items-center justify-center gap-2 mt-4 group">
                        <span>Send Message</span>
                        <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>

        </div>
    );
};
