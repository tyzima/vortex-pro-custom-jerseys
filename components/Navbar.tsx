
import React from 'react';
import { ShoppingCart, Menu, MessageSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  onHomeClick?: () => void;
  onMenuClick: (menu: string) => void;
  onDesignClick: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  currentView?: string;
}

export const Navbar: React.FC<NavbarProps & { currentView: string }> = ({ onHomeClick, onMenuClick, onDesignClick, cartCount = 0, onCartClick, currentView }) => {
  const { theme, toggleTheme } = useTheme();

  // Reusable Nav Link Component with animated underline
  const NavLink = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="relative group py-2"
    >
      <span className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400 group-hover:text-brand-white transition-colors duration-300">
        {label}
      </span>
      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-black/90 backdrop-blur-md border-b border-brand-border transition-all duration-300">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:rotate-180 transition-transform duration-700">
            <path d="M16 0L32 8L28 24L16 32L4 24L0 8L16 0Z" fill="#D2F802" />
            <path d="M16 6L26 11L23.5 21L16 26L8.5 21L6 11L16 6Z" className="fill-brand-white" />
          </svg>
          <span className="font-display text-2xl text-brand-white italic tracking-wider group-hover:text-brand-accent transition-colors">ARRIX</span>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex items-center gap-12 absolute left-1/2 transform -translate-x-1/2">
          <NavLink label="How It Works" onClick={() => onMenuClick('how-it-works')} />
          <NavLink label="Team Packs" onClick={() => onMenuClick('team-packs')} />
          <NavLink label="Fabrics" onClick={() => onMenuClick('fabrics')} />
          <NavLink label="Tournaments" onClick={() => onMenuClick('tournaments')} />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-8">
          {/* Icons Group */}
          <div className={`flex items-center gap-6 ${currentView === 'builder' ? '' : 'border-r border-brand-border pr-8'}`}>
            <button
              onClick={toggleTheme}
              className="text-neutral-400 hover:text-brand-accent transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => onMenuClick('contact')}
              className="text-neutral-400 hover:text-brand-accent transition-colors"
              title="Contact Us"
            >
              <MessageSquare size={20} />
            </button>

            <button
              onClick={onCartClick}
              className="text-brand-white hover:text-brand-accent transition-colors relative group"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-accent text-black text-[10px] flex items-center justify-center rounded-full font-bold group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(210,248,2,0.5)]">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* CTA Button - Hidden on Builder Page */}
          {currentView !== 'builder' && (
            <button
              onClick={onDesignClick}
              className="hidden lg:flex items-center gap-2 bg-brand-accent text-black px-6 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(210,248,2,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
            >
              <span>Start Design</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-brand-white hover:text-brand-accent transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
