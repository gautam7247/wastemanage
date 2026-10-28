import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmerApi, buyerApi } from '../api/apiService';
import { X, User, Tractor, Factory, MapPin, Save, Loader2 } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose, onNotify }) => {
  const { user, isFarmer, isBuyer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Farmer form state
  const [farmerData, setFarmerData] = useState({
    farmerName: '',
    farmName: '',
    addressLine: '',
    village: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    farmDescription: '',
  });

  // Buyer form state
  const [buyerData, setBuyerData] = useState({
    buyerType: 'RECYCLER',
    organizationName: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    description: '',
  });

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    if (isFarmer) {
      farmerApi
        .getMe()
        .then((res) => {
          if (res.data) {
            setFarmerData({
              farmerName: res.data.farmerName || user?.fullName || '',
              farmName: res.data.farmName || '',
              addressLine: res.data.addressLine || '',
              village: res.data.village || '',
              city: res.data.city || '',
              state: res.data.state || '',
              postalCode: res.data.postalCode || '',
              latitude: res.data.latitude || '',
              longitude: res.data.longitude || '',
              farmDescription: res.data.farmDescription || '',
            });
          }
        })
        .catch((err) => console.warn('Could not fetch farmer profile', err))
        .finally(() => setLoading(false));
    } else if (isBuyer) {
      buyerApi
        .getMe()
        .then((res) => {
          if (res.data) {
            setBuyerData({
              buyerType: res.data.buyerType || 'RECYCLER',
              organizationName: res.data.organizationName || user?.fullName || '',
              addressLine: res.data.addressLine || '',
              city: res.data.city || '',
              state: res.data.state || '',
              postalCode: res.data.postalCode || '',
              latitude: res.data.latitude || '',
              longitude: res.data.longitude || '',
              description: res.data.description || '',
            });
          }
        })
        .catch((err) => console.warn('Could not fetch buyer profile', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isOpen, isFarmer, isBuyer, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isFarmer) {
        await farmerApi.updateMe({
          ...farmerData,
          latitude: farmerData.latitude ? parseFloat(farmerData.latitude) : undefined,
          longitude: farmerData.longitude ? parseFloat(farmerData.longitude) : undefined,
        });
        onNotify('Farmer profile and farm location updated successfully!', 'success');
      } else if (isBuyer) {
        await buyerApi.updateMe({
          ...buyerData,
          latitude: buyerData.latitude ? parseFloat(buyerData.latitude) : undefined,
          longitude: buyerData.longitude ? parseFloat(buyerData.longitude) : undefined,
        });
        onNotify('Buyer profile and plant location updated successfully!', 'success');
      }
      onClose();
    } catch (err) {
      onNotify('Update failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-brand-400">
              {isFarmer ? <Tractor className="w-5 h-5" /> : <Factory className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isFarmer ? 'Farmer Profile & Farm Location' : 'Buyer Profile & Facility Location'}
              </h3>
              <p className="text-xs text-stone-400">
                {user?.fullName} ({user?.email}) • Role: {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isFarmer ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Farmer Full Name</label>
                      <input
                        type="text"
                        value={farmerData.farmerName}
                        onChange={(e) => setFarmerData({ ...farmerData, farmerName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Farm / Estate Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Kisan Organic Agro Farm"
                        value={farmerData.farmName}
                        onChange={(e) => setFarmerData({ ...farmerData, farmName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Canal, Samrala Road"
                      value={farmerData.addressLine}
                      onChange={(e) => setFarmerData({ ...farmerData, addressLine: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Village</label>
                      <input
                        type="text"
                        value={farmerData.village}
                        onChange={(e) => setFarmerData({ ...farmerData, village: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">City / District</label>
                      <input
                        type="text"
                        required
                        value={farmerData.city}
                        onChange={(e) => setFarmerData({ ...farmerData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={farmerData.state}
                        onChange={(e) => setFarmerData({ ...farmerData, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={farmerData.postalCode}
                        onChange={(e) => setFarmerData({ ...farmerData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Latitude (for Smart Matching)</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="30.901000"
                        value={farmerData.latitude}
                        onChange={(e) => setFarmerData({ ...farmerData, latitude: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Longitude (for Smart Matching)</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="75.857300"
                        value={farmerData.longitude}
                        onChange={(e) => setFarmerData({ ...farmerData, longitude: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Farm Bio & Description</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what crops you grow, typical waste output (vegetable residue, wheat stubble, paddy straw)..."
                      value={farmerData.farmDescription}
                      onChange={(e) => setFarmerData({ ...farmerData, farmDescription: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Buyer Organization Name</label>
                      <input
                        type="text"
                        value={buyerData.organizationName}
                        onChange={(e) => setBuyerData({ ...buyerData, organizationName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Facility Type</label>
                      <select
                        value={buyerData.buyerType}
                        onChange={(e) => setBuyerData({ ...buyerData, buyerType: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="RECYCLER">General Recycler</option>
                        <option value="COMPOST_MANUFACTURER">Compost Manufacturer</option>
                        <option value="COMPOST_UNIT">Community / Bio-Gas Compost Unit</option>
                        <option value="OTHER">Other Industrial Processor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Processing Facility Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Phase 2, Industrial Focal Point"
                      value={buyerData.addressLine}
                      onChange={(e) => setBuyerData({ ...buyerData, addressLine: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={buyerData.city}
                        onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={buyerData.state}
                        onChange={(e) => setBuyerData({ ...buyerData, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={buyerData.postalCode}
                        onChange={(e) => setBuyerData({ ...buyerData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="30.880000"
                        value={buyerData.latitude}
                        onChange={(e) => setBuyerData({ ...buyerData, latitude: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="75.830000"
                        value={buyerData.longitude}
                        onChange={(e) => setBuyerData({ ...buyerData, longitude: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Organization Description</label>
                    <textarea
                      rows={3}
                      placeholder="Specify your processing capacity, required feedstock specifications (moisture level, purity)..."
                      value={buyerData.description}
                      onChange={(e) => setBuyerData({ ...buyerData, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white transition-colors shadow-sm disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
