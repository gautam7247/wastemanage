import React, { useEffect, useState } from 'react';
import { listingsApi } from '../api/apiService';
import { unwrap } from '../api/client';
import { X, MapPin, Loader2, ShoppingCart, User, Calendar, Scale } from 'lucide-react';

export const ListingDetailModal = ({ listingId, isOpen, onClose, onOrderClick, onViewFarmer }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !listingId) return;
    setLoading(true);
    setError('');
    listingsApi
      .getById(listingId)
      .then((res) => setListing(unwrap(res)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isOpen, listingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-brand-800 to-emerald-800 text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold">Listing details</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : listing ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {listing.materialTypeName}
                </span>
                <h4 className="text-lg font-black text-stone-900 mt-2">{listing.title}</h4>
                <p className="text-sm text-stone-600 mt-1">{listing.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <Scale className="w-4 h-4 text-stone-400 mb-1" />
                  <p className="text-[10px] text-stone-500">Available</p>
                  <p className="font-black">
                    {listing.quantityAvailable} {listing.unit}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <p className="text-[10px] text-stone-500">Rate</p>
                  <p className="font-black text-brand-700">
                    ₹{Number(listing.pricePerUnit).toFixed(2)} / {listing.unit}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-stone-600">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  {[listing.pickupAddress, listing.village, listing.city, listing.state, listing.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
              {listing.availabilityDate && (
                <p className="flex items-center gap-2 text-xs text-stone-500">
                  <Calendar className="w-3.5 h-3.5" /> Available from {listing.availabilityDate}
                </p>
              )}
              <button
                onClick={() => onViewFarmer(listing.supplierId)}
                className="flex items-center gap-2 text-sm font-semibold text-brand-800"
              >
                <User className="w-4 h-4" /> {listing.supplierName}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOrderClick(listing);
                }}
                disabled={listing.listingStatus !== 'AVAILABLE'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-700 text-white text-sm font-bold disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" /> Place order
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ListingDetailModal;
