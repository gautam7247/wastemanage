import React, { useState, useEffect } from 'react';
import { farmerApi } from '../api/apiService';
import { X, Tractor, MapPin, User, Loader2, Sparkles } from 'lucide-react';

export const ViewFarmerModal = ({ farmerId, isOpen, onClose }) => {
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !farmerId) return;
    setLoading(true);
    farmerApi
      .getPublic(farmerId)
      .then((res) => setFarmer(res.data))
      .catch((err) => console.warn('Could not load public farmer profile', err))
      .finally(() => setLoading(false));
  }, [isOpen, farmerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-brand-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-brand-300">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Farmer Public Profile</h3>
              <p className="text-xs text-brand-200">Verified Agricultural Supplier</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
            </div>
          ) : farmer ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Farm Profile
                </span>
                <h4 className="text-lg font-black text-stone-900 mt-1">
                  {farmer.farmName || 'Kisan Organic Farm'}
                </h4>
                <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  Cultivator: <strong className="text-stone-800">{farmer.farmerName || 'Farmer'}</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-800">
                      {[farmer.village, farmer.city, farmer.state].filter(Boolean).join(', ')}
                    </p>
                    {farmer.postalCode && (
                      <p className="text-stone-500 text-[11px]">Postal PIN: {farmer.postalCode}</p>
                    )}
                  </div>
                </div>

                {farmer.latitude && farmer.longitude && (
                  <div className="text-[11px] text-stone-500 font-mono pl-6">
                    GPS: {Number(farmer.latitude).toFixed(4)}° N, {Number(farmer.longitude).toFixed(4)}° E
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-xs font-bold text-stone-700 mb-1">Farm Description & Output</h5>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                  {farmer.farmDescription ||
                    'Specializes in sustainable cultivation, seasonal vegetable sorting residue, wheat straw stubble, and nutrient-dense farm biomass.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500 text-center py-6">Farmer profile details not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFarmerModal;
