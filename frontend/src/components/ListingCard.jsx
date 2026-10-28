import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Layers,
  Scale,
  IndianRupee,
  ShoppingCart,
  User,
  ShieldCheck,
} from 'lucide-react';

export const ListingCard = ({ listing, onOrderClick, onViewFarmer }) => {
  const { user, isBuyer, isAuthenticated } = useAuth();

  const isAvailable = listing.listingStatus === 'AVAILABLE';
  const isOwner = user?.id === listing.supplierId;

  // Material Badge Color mapping
  const getBadgeStyle = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('vegetable')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (lower.includes('fruit')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (lower.includes('stubble') || lower.includes('straw') || lower.includes('crop'))
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (lower.includes('bagasse')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (lower.includes('manure')) return 'bg-stone-200 text-stone-800 border-stone-300';
    return 'bg-brand-50 text-brand-800 border-brand-200';
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${getBadgeStyle(
              listing.materialTypeName
            )}`}
          >
            {listing.materialTypeName || 'Organic Farm Waste'}
          </span>

          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {listing.listingStatus}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-extrabold text-stone-900 text-base leading-snug group-hover:text-brand-700 transition-colors line-clamp-1">
          {listing.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {listing.description || 'Clean, field-collected agricultural sorting waste ready for bio-fertilizer.'}
        </p>

        {/* Key Pricing & Quantity Box */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/60">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <Scale className="w-3.5 h-3.5 text-stone-400" />
              <span>Available Qty</span>
            </div>
            <p className="text-sm font-black text-stone-800 mt-0.5">
              {Number(listing.quantityAvailable).toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-stone-500">{listing.unit}</span>
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <IndianRupee className="w-3.5 h-3.5 text-brand-600" />
              <span>Rate / {listing.unit}</span>
            </div>
            <p className="text-sm font-black text-brand-700 mt-0.5">
              ₹{Number(listing.pricePerUnit).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Location & Farmer details */}
        <div className="mt-3.5 space-y-1.5 text-xs text-stone-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">
              {[listing.village, listing.city, listing.state].filter(Boolean).join(', ') || 'Punjab, India'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
            <button
              onClick={() => onViewFarmer(listing.supplierId)}
              className="flex items-center gap-1 hover:text-brand-700 font-medium transition-colors"
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span className="truncate max-w-[130px] font-semibold text-stone-700 hover:underline">
                {listing.supplierName || 'Farmer'}
              </span>
            </button>

            {listing.availabilityDate && (
              <span className="flex items-center gap-1 text-[10px] text-stone-400">
                <Calendar className="w-3 h-3" />
                {listing.availabilityDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer / Action Button */}
      <div className="p-4 pt-2 border-t border-stone-100 bg-stone-50/50">
        {isOwner ? (
          <div className="text-center py-1.5 text-xs font-bold text-stone-500 bg-stone-100 rounded-xl">
            🌾 Listed by you
          </div>
        ) : (
          <button
            onClick={() => onOrderClick(listing)}
            disabled={!isAvailable}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
              isAvailable
                ? 'bg-brand-700 hover:bg-brand-800 text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAvailable ? 'Procure / Place Order' : 'Listing Unavailable'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
