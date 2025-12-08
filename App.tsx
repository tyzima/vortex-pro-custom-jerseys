
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Customizer } from './components/Customizer';
import { Features } from './components/Features';
import { TrustBar } from './components/TrustBar';
import { Testimonials } from './components/Testimonials';
import { Overlay } from './components/ui/Overlay';
import { TeamPacks } from './components/overlays/TeamPacks';
import { Fabrics } from './components/overlays/Fabrics';
import { Tournaments } from './components/overlays/Tournaments';
import { Contact } from './components/overlays/Contact';
import { HowItWorks } from './components/overlays/HowItWorks';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Checkout } from './components/Checkout';
import { CartItem } from './types';
import { ArrowLeft } from 'lucide-react';
import { ThemeProvider } from './components/ThemeContext';

const AppContent = () => {
  const [view, setView] = useState<'home' | 'builder' | 'admin' | 'checkout'>('home');
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Initialize Cart from LocalStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vortex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cart", e);
      return [];
    }
  });

  // Persist Cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vortex_cart', JSON.stringify(cart));
  }, [cart]);

  const closeOverlay = () => setActiveOverlay(null);

  // Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleUpdateCartItem = (itemId: string, updatedItem: CartItem) => {
    setCart(prev => prev.map(item => item.id === itemId ? updatedItem : item));
    setEditingItemId(null);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const getOverlayContent = (id: string) => {
    switch (id) {
      case 'how-it-works':
        return {
          title: 'How It Works',
          component: <HowItWorks onContactClick={() => setActiveOverlay('contact')} />
        };
      case 'team-packs':
        return {
          title: 'Team Bundles',
          component: <TeamPacks />
        };
      case 'fabrics':
        return {
          title: 'Fabric Technology',
          component: <Fabrics />
        };
      case 'tournaments':
        return {
          title: 'Official Tournaments',
          component: <Tournaments />
        };
      case 'contact':
        return {
          title: 'Contact Us',
          component: <Contact />
        };
      default:
        return null;
    }
  };

  const activeOverlayContent = activeOverlay ? getOverlayContent(activeOverlay) : null;

  return (
    <div className="bg-brand-black fixed inset-0 w-full h-full selection:bg-brand-accent selection:text-black flex flex-col">
      <Navbar
        onHomeClick={() => setView('home')}
        onMenuClick={(menu) => setActiveOverlay(menu)}
        onDesignClick={() => setView('builder')}
        cartCount={cart.length}
        onCartClick={() => setView('checkout')}
        currentView={view}
      />

      {/* UNIFIED OVERLAY RENDERER */}
      {activeOverlay && activeOverlayContent && (
        <Overlay
          title={activeOverlayContent.title}
          onClose={closeOverlay}
          currentOverlay={activeOverlay}
          onNavigate={setActiveOverlay}
        >
          {activeOverlayContent.component}
        </Overlay>
      )}

      {/* ADMIN DASHBOARD */}
      {view === 'admin' && (
        <AdminDashboard onExit={() => setView('home')} />
      )}

      {/* CHECKOUT VIEW */}
      {view === 'checkout' && (
        <Checkout
          cart={cart}
          onRemoveItem={handleRemoveFromCart}
          onUpdateCartItem={handleUpdateCartItem}
          onEditItem={(itemId) => {
            setEditingItemId(itemId);
            setView('builder');
          }}
          onBack={() => setView('builder')}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full min-h-0">

        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden animate-fade-in pt-20">
            <Hero onStart={() => setView('builder')} />
            <TrustBar />
            <Features />
            <Testimonials />

            <footer className="bg-brand-black py-12 border-t border-brand-border">
              <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-50 text-xs text-neutral-500 uppercase tracking-widest">
                <p>&copy; 2024 Arrix Sports. All Rights Reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                  <a href="#" className="hover:text-brand-white">Privacy</a>
                  <a href="#" className="hover:text-brand-white">Terms</a>
                  <a href="#" className="hover:text-brand-white">Support</a>
                  <button onClick={() => setView('admin')} className="hover:text-brand-accent transition-colors">Admin</button>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* VIEW: BUILDER */}
        {view === 'builder' && (
          <div className="absolute inset-0 w-full h-full bg-brand-black z-10">
            {/* Back Button Overlay */}


            <Customizer
              onAddToCart={handleAddToCart}
              onUpdateCartItem={handleUpdateCartItem}
              editingItemId={editingItemId}
              editingItem={editingItemId ? cart.find(item => item.id === editingItemId) : undefined}
              onCheckout={() => setView('checkout')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
