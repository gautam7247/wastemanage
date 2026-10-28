import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Store,
  Sparkles,
  Tractor,
  Factory,
  User,
  LogOut,
  LogIn,
  ChevronDown,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenProfile,
  onNotify,
}) => {
  const { user, isAuthenticated, isFarmer, isBuyer, logout, loginAsDemoFarmer, loginAsDemoBuyer } =
    useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoSwitch = async (roleType) => {
    setDemoLoading(true);
    try {
      if (roleType === 'farmer') {
        await loginAsDemoFarmer();
        onNotify('Logged in as Demo Farmer (Ramesh Kumar)', 'success');
        setActiveTab('farmer');
      } else {
        await loginAsDemoBuyer();
        onNotify('Logged in as Demo Recycler (BioCompost Agro)', 'success');
        setActiveTab('buyer');
      }
    } catch (err) {
      onNotify('Demo login failed: ' + err.message, 'error');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-stone-900">ReLoop</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-brand-100 text-brand-800 tracking-wider">
                  GreenTech
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Farmer-to-Recycler Waste Marketplace
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-brand-50 text-brand-800 border border-brand-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Store className="w-4 h-4" />
              Marketplace
            </button>

            {/* Smart Matches - Especially for Buyers */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth('login');
                  return;
                }
                setActiveTab('matching');
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'matching'
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Smart Matching
            </button>

            {/* Farmer Hub Link */}
            {(!isAuthenticated || isFarmer) && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenAuth('login');
                    return;
                  }
                  setActiveTab('farmer');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'farmer'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Tractor className="w-4 h-4 text-emerald-600" />
                Farmer Hub
              </button>
            )}

            {/* Buyer Hub Link */}
            {(!isAuthenticated || isBuyer) && (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onOpenAuth('login');
                    return;
                  }
                  setActiveTab('buyer');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'buyer'
                    ? 'bg-blue-50 text-blue-900 border border-blue-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Factory className="w-4 h-4 text-blue-600" />
                Buyer / Recycler Hub
              </button>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* 1-Click Demo Account Quick Switcher */}
            <div className="hidden lg:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <span className="px-2 text-stone-500 font-medium">Quick Demo:</span>
              <button
                disabled={demoLoading}
                onClick={() => handleDemoSwitch('farmer')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  isFarmer
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                🌾 Farmer
              </button>
              <button
                disabled={demoLoading}
                onClick={() => handleDemoSwitch('buyer')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  isBuyer
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-stone-700 hover:bg-white'
                }`}
              >
                🏭 Recycler
              </button>
            </div>

            {/* User Profile or Login/Register */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {user?.fullName}
                    </p>
                    <p className="text-[10px] font-medium text-stone-500">
                      {isFarmer ? '🌾 Farmer (Supplier)' : '🏭 Recycler (Buyer)'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-800">{user?.fullName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                        <ShieldCheck className="w-3 h-3" />
                        Role: {user?.role}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenProfile()}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      Manage Profile & Address
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        onNotify('Logged out successfully', 'success');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-stone-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('marketplace');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg text-stone-700 hover:bg-stone-100"
          >
            <Store className="w-4 h-4" />
            Marketplace
          </button>
          <button
            onClick={() => {
              setActiveTab('matching');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg text-stone-700 hover:bg-stone-100"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Smart Matching
          </button>
          <button
            onClick={() => {
              setActiveTab('farmer');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg text-stone-700 hover:bg-stone-100"
          >
            <Tractor className="w-4 h-4 text-emerald-600" />
            Farmer Hub
          </button>
          <button
            onClick={() => {
              setActiveTab('buyer');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg text-stone-700 hover:bg-stone-100"
          >
            <Factory className="w-4 h-4 text-blue-600" />
            Buyer Hub
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
