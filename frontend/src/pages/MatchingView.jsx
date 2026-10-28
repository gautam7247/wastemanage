import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { matchingApi, requirementsApi } from '../api/apiService';
import { asList } from '../api/client';
import {
  Sparkles,
  MapPin,
  ShoppingCart,
  RefreshCw,
  Factory,
  Compass,
  CheckCircle2,
  BadgeIndianRupee,
} from 'lucide-react';

const flattenMatch = (m) => {
  const listing = m.listing || m;
  const farmer = m.farmer || {};
  return {
    ...listing,
    listingId: listing.id,
    distanceKm: m.distanceKm,
    matchType: m.matchType,
    priceMatched: m.priceMatched,
    quantityMatched: m.quantityMatched,
    farmerProfileId: farmer.id,
    farmName: farmer.farmName,
    farmerName: farmer.farmerName || listing.supplierName,
  };
};

export const MatchingView = ({ onOrderClick, onViewFarmer, onOpenAuth }) => {
  const { isAuthenticated, isBuyer, loginAsDemoBuyer } = useAuth();
  const [matches, setMatches] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [requirementId, setRequirementId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async (reqId = requirementId) => {
    if (!isAuthenticated || !isBuyer) return;
    setLoading(true);
    setError('');
    try {
      const [matchRes, reqRes] = await Promise.all([
        matchingApi.getMatches(reqId || undefined),
        requirementsApi.getMyRequirements().catch(() => ({ data: { content: [] } })),
      ]);
      setMatches(asList(matchRes).map(flattenMatch));
      setRequirements(asList(reqRes).filter((r) => r.active));
    } catch (err) {
      setError(err.message || 'Could not load matches. Create an active requirement in Buyer Hub first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      loadMatches();
    }
  }, [isAuthenticated, isBuyer]);

  if (!isAuthenticated || !isBuyer) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">Smart Farm-to-Recycler Matching</h2>
        <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          Matches your factory requirements with nearby farmer listings by material, quantity, price
          ceiling, and GPS distance.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm shadow-md"
          >
            Sign in as Recycler
          </button>
          <button
            onClick={async () => {
              await loginAsDemoBuyer();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 font-bold text-sm"
          >
            <Factory className="w-4 h-4 text-blue-700" />
            Use Demo Recycler Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-amber-800/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Location + price matching
          </div>
          <h2 className="text-2xl font-black text-white">Recommended Farmer Listings</h2>
          <p className="text-sm text-stone-300 mt-1 max-w-xl">
            Live matches from GET /api/matches using your active procurement requirements.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <select
            value={requirementId}
            onChange={(e) => {
              setRequirementId(e.target.value);
              loadMatches(e.target.value);
            }}
            className="px-3 py-2 text-sm rounded-xl bg-white/10 border border-white/20 text-white"
          >
            <option value="" className="text-stone-900">
              All active requirements
            </option>
            {requirements.map((r) => (
              <option key={r.id} value={r.id} className="text-stone-900">
                {r.materialTypeName} · {r.requiredQuantity} {r.unit}
              </option>
            ))}
          </select>
          <button
            onClick={() => loadMatches()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recalculate
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-stone-200 p-6 animate-pulse" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m, idx) => (
            <div
              key={m.listingId || idx}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {m.materialTypeName || 'Organic Material'}
                  </span>
                  {m.distanceKm !== null && m.distanceKm !== undefined ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-800 border border-blue-200">
                      <Compass className="w-3 h-3 text-blue-600" />
                      {Number(m.distanceKm).toFixed(1)} km
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 text-stone-700">
                      {m.matchType || 'Match'}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-stone-900 text-base">{m.title}</h4>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{m.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.priceMatched && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <BadgeIndianRupee className="w-3 h-3" /> Price fit
                    </span>
                  )}
                  {m.quantityMatched && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      <CheckCircle2 className="w-3 h-3" /> Qty fit
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold block">Available</span>
                    <span className="font-black text-stone-800">
                      {m.quantityAvailable} {m.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold block">Rate</span>
                    <span className="font-black text-brand-700">₹{m.pricePerUnit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold block">Farmer</span>
                    <span className="font-bold text-stone-700 truncate block">
                      {m.farmerName || m.supplierName || 'Farmer'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">
                    {[m.village, m.city, m.state].filter(Boolean).join(', ') || m.farmName || 'Punjab, India'}
                  </span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center gap-2">
                <button
                  onClick={() => onViewFarmer(m.farmerProfileId || m.supplierId)}
                  className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
                >
                  View Farmer
                </button>
                <button
                  onClick={() => onOrderClick({ ...m, id: m.listingId || m.id })}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white shadow-sm"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Procure Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-sm font-bold text-stone-800">No Direct Matches Right Now</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Post a requirement in the Buyer Hub, or raise your max price / distance.
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchingView;
