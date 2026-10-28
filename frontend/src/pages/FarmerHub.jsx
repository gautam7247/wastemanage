import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listingsApi, ordersApi, materialsApi } from '../api/apiService';
import {
  Tractor,
  PlusCircle,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  MapPin,
  Calendar,
  Layers,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const FarmerHub = ({ onNotify, onOpenAuth }) => {
  const { isAuthenticated, isFarmer, loginAsDemoFarmer, user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('listings'); // 'listings', 'orders', 'create'
  const [myListings, setMyListings] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New Listing Form State
  const [formData, setFormData] = useState({
    materialTypeId: '',
    title: '',
    description: '',
    quantityAvailable: '',
    unit: 'KG',
    pricePerUnit: '',
    minimumOrderQuantity: '50',
    pickupAddress: '',
    village: '',
    city: 'Ludhiana',
    state: 'Punjab',
    postalCode: '141114',
    latitude: '30.901000',
    longitude: '75.857300',
    availabilityDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadFarmerData = async () => {
    if (!isAuthenticated || !isFarmer) return;
    setLoading(true);
    try {
      const [listRes, ordRes, matRes] = await Promise.all([
        listingsApi.getMyListings().catch(() => ({ data: [] })),
        ordersApi.getMyOrders().catch(() => ({ data: [] })),
        materialsApi.getAll().catch(() => ({ data: [] })),
      ]);

      setMyListings(listRes.data?.content || listRes.data || []);
      setMyOrders(ordRes.data?.content || ordRes.data || []);
      if (matRes.data) {
        setMaterials(matRes.data);
        if (matRes.data.length > 0 && !formData.materialTypeId) {
          setFormData((prev) => ({ ...prev, materialTypeId: matRes.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.warn('Error loading farmer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isFarmer) {
      loadFarmerData();
    }
  }, [isAuthenticated, isFarmer]);

  // Handle Order Actions (Accept / Reject)
  const handleAcceptOrder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await ordersApi.accept(orderId);
      onNotify(`Order #${orderId} accepted successfully!`, 'success');
      loadFarmerData();
    } catch (err) {
      onNotify('Failed to accept order: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await ordersApi.reject(orderId);
      onNotify(`Order #${orderId} rejected and stock returned.`, 'success');
      loadFarmerData();
    } catch (err) {
      onNotify('Failed to reject order: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Listing Status (AVAILABLE <-> CLOSED)
  const handleToggleListingStatus = async (listingId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'CLOSED' : 'AVAILABLE';
    setActionLoadingId(listingId);
    try {
      await listingsApi.updateStatus(listingId, nextStatus);
      onNotify(`Listing marked as ${nextStatus}!`, 'success');
      loadFarmerData();
    } catch (err) {
      onNotify('Status update failed: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create Listing Submit
  const handleCreateListing = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await listingsApi.create({
        materialTypeId: Number(formData.materialTypeId),
        title: formData.title,
        description: formData.description,
        quantityAvailable: Number(formData.quantityAvailable),
        unit: formData.unit,
        pricePerUnit: Number(formData.pricePerUnit),
        minimumOrderQuantity: formData.minimumOrderQuantity ? Number(formData.minimumOrderQuantity) : 1,
        pickupAddress: formData.pickupAddress || undefined,
        village: formData.village || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        availabilityDate: formData.availabilityDate || undefined,
      });

      onNotify('New farm waste listing published successfully!', 'success');
      setActiveSubTab('listings');
      loadFarmerData();
    } catch (err) {
      setFormError(err.message || 'Failed to publish listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || !isFarmer) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
          <Tractor className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">Farmer & Supplier Hub</h2>
        <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
          Monetize your agricultural, crop stubble, and vegetable waste. Register as a verified farmer
          to list waste materials, specify prices, and receive direct orders from compost factories.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Farmer Sign In
          </button>
          <button
            onClick={async () => {
              await loginAsDemoFarmer();
              loadFarmerData();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors"
          >
            <Tractor className="w-4 h-4 text-emerald-700" />
            Use Demo Farmer (Ramesh Kumar)
          </button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalListings = myListings.length;
  const activeListings = myListings.filter((l) => l.listingStatus === 'AVAILABLE').length;
  const pendingOrders = myOrders.filter((o) => o.orderStatus === 'PENDING').length;
  const totalRevenue = myOrders
    .filter((o) => o.orderStatus === 'ACCEPTED' || o.orderStatus === 'COMPLETED')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & KPI Header */}
      <div className="bg-gradient-to-r from-brand-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-brand-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
              <Tractor className="w-3.5 h-3.5" />
              Verified Farmer Portal
            </div>
            <h2 className="text-2xl font-black text-white">
              Kisan Dashboard — {user?.fullName}
            </h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Manage your agricultural waste listings, review incoming recycler orders, and track payments.
            </p>
          </div>

          <button
            onClick={() => setActiveSubTab('create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 hover:bg-brand-50 font-bold text-xs shadow-md transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-brand-700" />
            Publish New Waste Listing
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Total Waste Listings</span>
            <span className="text-xl font-black text-white mt-0.5 block">{totalListings}</span>
            <span className="text-[10px] text-emerald-300 font-medium">{activeListings} Active in Market</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Pending Recycler Orders</span>
            <span className="text-xl font-black text-amber-300 mt-0.5 block">{pendingOrders}</span>
            <span className="text-[10px] text-stone-300 font-medium">Awaiting your approval</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Confirmed Orders Value</span>
            <span className="text-xl font-black text-white mt-0.5 block">₹{totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-300 font-medium">From compost factories</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Circular Impact</span>
            <span className="text-xl font-black text-white mt-0.5 block">100% Recycled</span>
            <span className="text-[10px] text-emerald-300 font-medium">Zero burning certified</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'listings'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Package className="w-4 h-4" />
          My Waste Listings ({myListings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          Incoming Orders ({myOrders.length})
          {pendingOrders > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'create'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Post New Listing
        </button>
      </div>

      {/* Tab 1: My Listings Table */}
      {activeSubTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-extrabold text-stone-800 text-sm">Published Agricultural Waste</h3>
            <button
              onClick={loadFarmerData}
              disabled={loading}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Package className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">You haven't listed any farm waste yet.</p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-700 rounded-xl"
              >
                Create First Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 text-[11px] uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Title & Material</th>
                    <th className="py-3 px-4">Available Qty</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myListings.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">{item.title}</span>
                        <span className="text-[10px] text-brand-700 font-semibold">
                          {item.materialTypeName}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {item.quantityAvailable} {item.unit}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-brand-800">
                        ₹{Number(item.pricePerUnit).toFixed(2)} / {item.unit}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {[item.village, item.city].filter(Boolean).join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            item.listingStatus === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {item.listingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleToggleListingStatus(item.id, item.listingStatus)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                            item.listingStatus === 'AVAILABLE'
                              ? 'border-stone-300 text-stone-600 hover:bg-stone-100'
                              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : item.listingStatus === 'AVAILABLE' ? (
                            'Close Listing'
                          ) : (
                            'Re-open'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Incoming Orders Table */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-extrabold text-stone-800 text-sm">Recycler Waste Orders Received</h3>
            <button
              onClick={loadFarmerData}
              disabled={loading}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Clock className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">No orders received yet from buyers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 text-[11px] uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Buyer / Recycler</th>
                    <th className="py-3 px-4">Ordered Quantity</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Fulfillment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">#{ord.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-800 block">{ord.buyerName || 'Recycler'}</span>
                        {ord.notes && <span className="text-[10px] text-stone-400 italic">"{ord.notes}"</span>}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {ord.quantityOrdered} {ord.unit}
                      </td>
                      <td className="py-3 px-4 font-black text-brand-800">
                        ₹{Number(ord.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        <span className="font-medium">{ord.pickupOrDelivery}</span>
                        {ord.deliveryAddress && (
                          <span className="block text-[10px] text-stone-400 truncate max-w-[150px]">
                            {ord.deliveryAddress}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            ord.orderStatus === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.orderStatus === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ord.orderStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actionLoadingId === ord.id}
                              onClick={() => handleAcceptOrder(ord.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              disabled={actionLoadingId === ord.id}
                              onClick={() => handleRejectOrder(ord.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Create New Listing Form */}
      {activeSubTab === 'create' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-black text-stone-900">List Agricultural & Vegetable Waste</h3>
            <p className="text-xs text-stone-500">
              Directly advertise your farm's residues to verified bio-compost and recycling buyers.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Material Type *
                </label>
                <select
                  required
                  value={formData.materialTypeId}
                  onChange={(e) => setFormData({ ...formData, materialTypeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Listing Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Tomato sorting waste & green leafy residue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Description</label>
              <textarea
                rows={2}
                placeholder="Moisture level, packaging condition, suitability for compost or biogas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Available Qty *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="500"
                  value={formData.quantityAvailable}
                  onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-bold"
                >
                  <option value="KG">KG (Kilograms)</option>
                  <option value="TON">TON (Tons / Quintals)</option>
                  <option value="PIECE">PIECE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Rate (₹ / Unit) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="3.50"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-brand-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Min. Order Qty</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimumOrderQuantity}
                  onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Available Date</label>
                <input
                  type="date"
                  value={formData.availabilityDate}
                  onChange={(e) => setFormData({ ...formData, availabilityDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Village / Locality</label>
                <input
                  type="text"
                  placeholder="Samrala"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City / District</label>
                <input
                  type="text"
                  placeholder="Ludhiana"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
                <input
                  type="text"
                  placeholder="Punjab"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('listings')}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white transition-colors shadow-md disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Publish Waste Listing
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FarmerHub;
