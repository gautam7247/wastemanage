import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ProxyConfigModal from './components/ProxyConfigModal';
import OrderModal from './components/OrderModal';
import CheckoutModal from './components/CheckoutModal';
import ViewFarmerModal from './components/ViewFarmerModal';

import Marketplace from './pages/Marketplace';
import MatchingView from './pages/MatchingView';
import FarmerHub from './pages/FarmerHub';
import BuyerHub from './pages/BuyerHub';
import { materialsApi } from './api/apiService';
import { getApiBaseUrl } from './api/client';
import { Sliders, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace', 'matching', 'farmer', 'buyer'
  const [toast, setToast] = useState(null);

  // Modals state
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [proxyModalOpen, setProxyModalOpen] = useState(false);
  const [orderModal, setOrderModal] = useState({ open: false, listing: null });
  const [checkoutModal, setCheckoutModal] = useState({ open: false, order: null });
  const [farmerBioModal, setFarmerBioModal] = useState({ open: false, farmerId: null });

  // Backend connection status indicator
  const [backendStatus, setBackendStatus] = useState({ checking: true, connected: false });

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const checkBackend = async () => {
    try {
      await materialsApi.getAll();
      setBackendStatus({ checking: false, connected: true });
    } catch {
      setBackendStatus({ checking: false, connected: false });
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Backend Connectivity / Proxy Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-4 border-b border-stone-800 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  backendStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-medium text-stone-400">
              API Server: <code className="text-brand-300 font-mono">{getApiBaseUrl()}</code>
            </span>
            <span className="hidden sm:inline text-stone-500">|</span>
            <span className="hidden sm:inline text-stone-400">
              Status:{' '}
              <strong className={backendStatus.connected ? 'text-emerald-400' : 'text-amber-400'}>
                {backendStatus.checking
                  ? 'Connecting...'
                  : backendStatus.connected
                  ? 'Live (MySQL 8 Connected)'
                  : 'Backend Offline / Verifying'}
              </strong>
            </span>
          </div>

          <button
            onClick={() => setProxyModalOpen(true)}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors bg-stone-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-stone-700"
          >
            <Sliders className="w-3 h-3 text-brand-400" />
            Proxy / Port Config
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
        onOpenProfile={() => setProfileModalOpen(true)}
        onNotify={notify}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'marketplace' && (
          <Marketplace
            onOrderClick={(listing) => setOrderModal({ open: true, listing })}
            onViewFarmer={(farmerId) => setFarmerBioModal({ open: true, farmerId })}
            onOpenProxyModal={() => setProxyModalOpen(true)}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
            backendConnected={backendStatus.connected}
          />
        )}

        {activeTab === 'matching' && (
          <MatchingView
            onOrderClick={(listing) => setOrderModal({ open: true, listing })}
            onViewFarmer={(farmerId) => setFarmerBioModal({ open: true, farmerId })}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          />
        )}

        {activeTab === 'farmer' && (
          <FarmerHub
            onNotify={notify}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          />
        )}

        {activeTab === 'buyer' && (
          <BuyerHub
            onCheckoutClick={(order) => setCheckoutModal({ open: true, order })}
            onNotify={notify}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          />
        )}
      </main>

      {/* Footer with Contact Info & Helpline */}
      <Footer setActiveTab={setActiveTab} />

      {/* Modals & Dialogs */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      <AuthModal
        isOpen={authModal.open}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ open: false, mode: 'login' })}
        onNotify={notify}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onNotify={notify}
      />

      <ProxyConfigModal
        isOpen={proxyModalOpen}
        onClose={() => {
          setProxyModalOpen(false);
          checkBackend();
        }}
        onNotify={notify}
      />

      <OrderModal
        listing={orderModal.listing}
        isOpen={orderModal.open}
        onClose={() => setOrderModal({ open: false, listing: null })}
        onNotify={notify}
        onOrderSuccess={() => {
          setActiveTab('buyer');
          notify('Order created! Viewing in your Buyer Hub.', 'success');
        }}
      />

      <CheckoutModal
        order={checkoutModal.order}
        isOpen={checkoutModal.open}
        onClose={() => setCheckoutModal({ open: false, order: null })}
        onNotify={notify}
        onPaymentSuccess={() => {
          checkBackend();
        }}
      />

      <ViewFarmerModal
        farmerId={farmerBioModal.farmerId}
        isOpen={farmerBioModal.open}
        onClose={() => setFarmerBioModal({ open: false, farmerId: null })}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
