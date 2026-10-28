import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi, requirementsApi, materialsApi } from '../api/apiService';
import {
  Factory,
  ShoppingCart,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  MapPin,
  RefreshCw,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Target,
} from 'lucide-react';

export const BuyerHub = ({ onCheckoutClick, onNotify, onOpenAuth }) => {
  const { isAuthenticated, isBuyer, loginAsDemoBuyer, user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders', 'requirements', 'create-req'
  const [myOrders, setMyOrders] = useState([]);
  const [myRequirements, setMyRequirements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New Requirement Form State
  const [reqForm, setReqForm] = useState({
    materialTypeId: '',
    requiredQuantity: '500',
    unit: 'KG',
    maxPricePerUnit: '4.50',
    maxDistanceKm: '50',
    preferredVillage: '',
    preferredCity: 'Ludhiana',
    preferredState: 'Punjab',
    pickupOrDelivery: 'EITHER',
  });
  const [submittingReq, setSubmittingReq] = useState(false);
  const [formError, setFormError] = useState('');

  const loadBuyerData = async () => {
    if (!isAuthenticated || !isBuyer) return;
    setLoading(true);
    try {
      const [ordRes, reqRes, matRes] = await Promise.all([
        ordersApi.getMyOrders().catch(() => ({ data: [] })),
        requirementsApi.getMyRequirements().catch(() => ({ data: [] })),
        materialsApi.getAll().catch(() => ({ data: [] })),
      ]);

      setMyOrders(ordRes.data?.content || ordRes.data || []);
      setMyRequirements(reqRes.data?.content || reqRes.data || []);
      if (matRes.data) {
        setMaterials(matRes.data);
        if (matRes.data.length > 0 && !reqForm.materialTypeId) {
          setReqForm((prev) => ({ ...prev, materialTypeId: matRes.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.warn('Error loading buyer data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isBuyer) {
      loadBuyerData();
    }
  }, [isAuthenticated, isBuyer]);

  // Handle Cancel Order
  const handleCancelOrder = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      await ordersApi.cancel(orderId);
      onNotify(`Order #${orderId} cancelled and stock returned.`, 'success');
      loadBuyerData();
    } catch (err) {
      onNotify('Cancellation failed: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Requirement Active Status
  const handleToggleReqStatus = async (reqId, currentStatus) => {
    setActionLoadingId(reqId);
    try {
      await requirementsApi.updateStatus(reqId, !currentStatus);
      onNotify(`Requirement status updated!`, 'success');
      loadBuyerData();
    } catch (err) {
      onNotify('Status update failed: ' + err.message, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Requirement
  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmittingReq(true);
    try {
      await requirementsApi.create({
        materialTypeId: Number(reqForm.materialTypeId),
        requiredQuantity: Number(reqForm.requiredQuantity),
        unit: reqForm.unit,
        maxPricePerUnit: reqForm.maxPricePerUnit ? Number(reqForm.maxPricePerUnit) : undefined,
        maxDistanceKm: reqForm.maxDistanceKm ? Number(reqForm.maxDistanceKm) : undefined,
        preferredVillage: reqForm.preferredVillage || undefined,
        preferredCity: reqForm.preferredCity || undefined,
        preferredState: reqForm.preferredState || undefined,
        pickupOrDelivery: reqForm.pickupOrDelivery,
      });

      onNotify('Procurement requirement published for Smart Matching!', 'success');
      setActiveSubTab('requirements');
      loadBuyerData();
    } catch (err) {
      setFormError(err.message || 'Failed to publish requirement.');
    } finally {
      setSubmittingReq(false);
    }
  };

  if (!isAuthenticated || !isBuyer) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
          <Factory className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-stone-900">Buyer & Recycler Hub</h2>
        <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
          Procure agricultural and vegetable waste directly from farmers for your bio-fertilizer,
          compost, or biogas units. Manage purchase orders, escrow payments, and procurement criteria.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Recycler Sign In
          </button>
          <button
            onClick={async () => {
              await loginAsDemoBuyer();
              loadBuyerData();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-colors"
          >
            <Factory className="w-4 h-4 text-blue-700" />
            Use Demo Recycler (BioCompost Agro)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-blue-950 via-stone-900 to-brand-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-blue-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
              <Factory className="w-3.5 h-3.5" />
              Recycler / Compost Facility
            </div>
            <h2 className="text-2xl font-black text-white">{user?.fullName}</h2>
            <p className="text-xs text-stone-300 mt-0.5">
              Manage your raw farm waste orders, tracking payments, and smart procurement requirements.
            </p>
          </div>

          <button
            onClick={() => setActiveSubTab('create-req')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-950 hover:bg-stone-50 font-bold text-xs shadow-md transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-blue-700" />
            Post Waste Requirement
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Total Orders Placed</span>
            <span className="text-xl font-black text-white mt-0.5 block">{myOrders.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Active Requirements</span>
            <span className="text-xl font-black text-blue-300 mt-0.5 block">
              {myRequirements.filter((r) => r.active).length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-stone-300 font-semibold block">Awaiting Payment</span>
            <span className="text-xl font-black text-emerald-300 mt-0.5 block">
              {myOrders.filter((o) => o.orderStatus === 'ACCEPTED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          My Orders & Payments ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveSubTab('requirements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'requirements'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <Target className="w-4 h-4" />
          My Requirements ({myRequirements.length})
        </button>

        <button
          onClick={() => setActiveSubTab('create-req')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'create-req'
              ? 'bg-brand-700 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Post Requirement
        </button>
      </div>

      {/* Tab 1: Orders Table */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-extrabold text-stone-800 text-sm">Farm Waste Orders Placed</h3>
            <button
              onClick={loadBuyerData}
              disabled={loading}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <ShoppingCart className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 text-[11px] uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Farmer / Supplier</th>
                    <th className="py-3 px-4">Ordered Quantity</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Payment & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">#{ord.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-800 block">{ord.supplierName || 'Farmer'}</span>
                        <span className="text-[10px] text-stone-400">Mode: {ord.pickupOrDelivery}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-800">
                        {ord.quantityOrdered} {ord.unit}
                      </td>
                      <td className="py-3 px-4 font-black text-brand-800">
                        ₹{Number(ord.totalAmount).toFixed(2)}
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
                        {ord.orderStatus === 'ACCEPTED' ? (
                          <button
                            onClick={() => onCheckoutClick(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now (UPI / Card)
                          </button>
                        ) : ord.orderStatus === 'PENDING' ? (
                          <button
                            disabled={actionLoadingId === ord.id}
                            onClick={() => handleCancelOrder(ord.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        ) : ord.orderStatus === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid & Completed
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Closed</span>
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

      {/* Tab 2: Requirements Table */}
      {activeSubTab === 'requirements' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-extrabold text-stone-800 text-sm">
              Your Active Procurement Requirements
            </h3>
            <button
              onClick={loadBuyerData}
              disabled={loading}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {myRequirements.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Target className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">No procurement requirements created yet.</p>
              <button
                onClick={() => setActiveSubTab('create-req')}
                className="px-4 py-2 text-xs font-bold text-white bg-brand-700 rounded-xl"
              >
                Create Requirement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-700 text-[11px] uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Material</th>
                    <th className="py-3 px-4">Required Quantity</th>
                    <th className="py-3 px-4">Max Price</th>
                    <th className="py-3 px-4">Max Distance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myRequirements.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{r.materialTypeName}</td>
                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {r.requiredQuantity} {r.unit}
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-800">
                        {r.maxPricePerUnit ? `₹${r.maxPricePerUnit} / ${r.unit}` : 'Any Price'}
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        {r.maxDistanceKm ? `${r.maxDistanceKm} km` : 'Unlimited'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            r.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {r.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleToggleReqStatus(r.id, r.active)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors"
                        >
                          {actionLoadingId === r.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : r.active ? (
                            'Deactivate'
                          ) : (
                            'Activate'
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

      {/* Tab 3: Post Requirement Form */}
      {activeSubTab === 'create-req' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-black text-stone-900">Post Waste Procurement Requirement</h3>
            <p className="text-xs text-stone-500">
              Specify the agricultural biomass you require. The Matching Service will scan farmer listings.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateRequirement} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Material Required *</label>
                <select
                  required
                  value={reqForm.materialTypeId}
                  onChange={(e) => setReqForm({ ...reqForm, materialTypeId: e.target.value })}
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
                <label className="block text-xs font-bold text-stone-700 mb-1">Required Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={reqForm.requiredQuantity}
                  onChange={(e) => setReqForm({ ...reqForm, requiredQuantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Unit</label>
                <select
                  value={reqForm.unit}
                  onChange={(e) => setReqForm({ ...reqForm, unit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="KG">KG</option>
                  <option value="TON">TON</option>
                  <option value="PIECE">PIECE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Max Price (₹ / unit)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 4.50"
                  value={reqForm.maxPricePerUnit}
                  onChange={(e) => setReqForm({ ...reqForm, maxPricePerUnit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-brand-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Max Radius (km)</label>
                <input
                  type="number"
                  step="1"
                  placeholder="50"
                  value={reqForm.maxDistanceKm}
                  onChange={(e) => setReqForm({ ...reqForm, maxDistanceKm: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred City</label>
                <input
                  type="text"
                  placeholder="Ludhiana"
                  value={reqForm.preferredCity}
                  onChange={(e) => setReqForm({ ...reqForm, preferredCity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred State</label>
                <input
                  type="text"
                  placeholder="Punjab"
                  value={reqForm.preferredState}
                  onChange={(e) => setReqForm({ ...reqForm, preferredState: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('requirements')}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReq}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white transition-colors shadow-md disabled:opacity-60"
              >
                {submittingReq ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Publish Requirement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BuyerHub;
