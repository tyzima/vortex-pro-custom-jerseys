
import React, { useState } from 'react';
import { ShoppingCart, Menu, MessageSquare, Sun, Moon, User, LogOut, Package } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onHomeClick?: () => void;
  onMenuClick: (menu: string) => void;
  onDesignClick: () => void;
  cartCount?: number;
  onCartClick?: () => void;
  onOrdersClick?: () => void;
  onAuthClick?: () => void;
  currentView?: string;
}

export const Navbar: React.FC<NavbarProps & { currentView: string }> = ({
  onHomeClick,
  onMenuClick,
  onDesignClick,
  cartCount = 0,
  onCartClick,
  onOrdersClick,
  onAuthClick,
  currentView
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

          {/* User Menu or Auth Button */}
          {user && profile ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-brand-border hover:border-brand-accent transition-colors"
              >
                <User size={16} className="text-brand-accent" />
                <span className="text-xs font-bold text-brand-white uppercase">{profile.full_name || 'User'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-brand-card border border-brand-border rounded-xl overflow-hidden shadow-lg">
                  <div className="p-3 border-b border-brand-border">
                    <p className="text-xs text-brand-secondary uppercase">Signed in as</p>
                    <p className="text-sm text-brand-white font-bold truncate">{profile.email}</p>
                    {profile.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-accent text-black text-[10px] font-bold uppercase rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  {onOrdersClick && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOrdersClick();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-2 text-brand-white hover:bg-brand-black/50 transition-colors text-xs font-bold uppercase"
                    >
                      <Package size={14} />
                      My Orders
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full px-4 py-3 flex items-center gap-2 text-red-400 hover:bg-brand-black/50 transition-colors text-xs font-bold uppercase"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            onAuthClick && (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-black transition-all text-xs font-bold uppercase tracking-wider"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )
          )}

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
