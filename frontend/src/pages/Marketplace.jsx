import React, { useState, useEffect } from 'react';
import { listingsApi, materialsApi } from '../api/apiService';
import ListingCard from '../components/ListingCard';
import {
  Search,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Sparkles,
  Sprout,
  ArrowRight,
  Sliders,
} from 'lucide-react';

export const Marketplace = ({
  onOrderClick,
  onViewFarmer,
  onOpenProxyModal,
  onOpenAuth,
  backendConnected,
}) => {
  const [listings, setListings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [matRes, listRes] = await Promise.all([
        materialsApi.getAll().catch(() => ({ data: [] })),
        listingsApi.getAll({
          materialTypeId: selectedMaterialId || undefined,
          city: searchCity || undefined,
        }),
      ]);

      if (matRes.data) setMaterials(matRes.data);

      const items = listRes.data?.content || listRes.data || [];
      setListings(items);
    } catch (err) {
      setError(err.message || 'Could not load listings. Verify Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMaterialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 text-white p-8 sm:p-12 shadow-xl border border-brand-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-brand-200">
            <Sprout className="w-3.5 h-3.5 text-brand-300" />
            Empowering 10,000+ Indian Farmers • Zero Crop Burning
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Turn Farm & Vegetable Waste Into Green Wealth 🌱
          </h1>

          <p className="text-sm sm:text-base text-brand-100 font-normal leading-relaxed">
            Direct farmer-to-recycler marketplace for vegetable sorting residue, fruit pulp, wheat &
            paddy stubble, and organic biomass. Connect with compost and bio-fertilizer factories.
          </p>

          {/* Quick Actions & Status Pill */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('marketplace-browse');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-brand-900 font-extrabold text-xs shadow-md hover:bg-brand-50 transition-colors"
            >
              Browse Active Waste Listings
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenProxyModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-brand-300" />
              Backend Proxy Settings
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* Filter and Search Bar */}
      <section id="marketplace-browse" className="space-y-4">
        {/* Material Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedMaterialId('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedMaterialId === ''
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Materials ({listings.length})
          </button>

          {materials.map((mat) => (
            <button
              key={mat.id}
              onClick={() => setSelectedMaterialId(mat.id.toString())}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedMaterialId === mat.id.toString()
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {mat.name}
            </button>
          ))}
        </div>

        {/* Search controls */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Filter by City or District (e.g. Ludhiana, Samrala, Khanna)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white shadow-sm transition-colors shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </form>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </section>

      {/* Listings Grid */}
      <section>
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div>
              <p className="font-bold">Backend Connection Notice:</p>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
            <button
              onClick={onOpenProxyModal}
              className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-bold text-xs shrink-0"
            >
              Configure Proxy URL
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-white border border-stone-200 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 bg-stone-200 rounded w-1/3" />
                <div className="h-6 bg-stone-200 rounded w-3/4" />
                <div className="h-16 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onOrderClick={onOrderClick}
                onViewFarmer={onViewFarmer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
            <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-800">No Waste Listings Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {searchCity || selectedMaterialId
                ? 'Try clearing the search filters or choosing a different waste category.'
                : 'No listings posted yet. Log in as a Farmer to publish the first farm waste listing!'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Marketplace;
