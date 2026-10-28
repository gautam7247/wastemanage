import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/apiService';
import { unwrap } from '../api/client';
import {
  X,
  ShoppingCart,
  MapPin,
  Truck,
  IndianRupee,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';

export const OrderModal = ({ listing, isOpen, onClose, onNotify, onOrderSuccess }) => {
  const { user, isBuyer, isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(
    listing?.minimumOrderQuantity ? Number(listing.minimumOrderQuantity) : 1
  );
  const [pickupOrDelivery, setPickupOrDelivery] = useState('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (listing) {
      setQuantity(listing.minimumOrderQuantity ? Number(listing.minimumOrderQuantity) : 1);
      setPickupOrDelivery('PICKUP');
      setDeliveryAddress('');
      setNotes('');
      setError('');
    }
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const unitPrice = Number(listing.pricePerUnit) || 0;
  const numQuantity = Number(quantity) || 0;
  const subtotal = numQuantity * unitPrice;
  const deliveryFee = pickupOrDelivery === 'DELIVERY' ? 50.0 : 0.0;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in as a Buyer / Recycler to place orders.');
      return;
    }

    if (!isBuyer) {
      setError('Only registered BUYERS (Recyclers, Compost Manufacturers) can place orders. Please switch role.');
      return;
    }

    if (numQuantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }

    if (numQuantity > Number(listing.quantityAvailable)) {
      setError(`Cannot order more than available quantity (${listing.quantityAvailable} ${listing.unit}).`);
      return;
    }

    setLoading(true);
    try {
      const res = await ordersApi.create({
        listingId: listing.id,
        quantityOrdered: numQuantity,
        pickupOrDelivery,
        deliveryAddress: pickupOrDelivery === 'DELIVERY' ? deliveryAddress : undefined,
        notes: notes || undefined,
      });

      onNotify('Order placed successfully! Awaiting farmer confirmation.', 'success');
      if (onOrderSuccess) onOrderSuccess(unwrap(res));
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-800 to-brand-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Procure Agricultural Waste</h3>
              <p className="text-xs text-brand-100">Farmer: {listing.supplierName}</p>
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
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 mb-4">
            <h4 className="text-xs font-bold text-stone-800 mb-1">{listing.title}</h4>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>
                Rate: <strong className="text-brand-700">₹{unitPrice.toFixed(2)}</strong> / {listing.unit}
              </span>
              <span>
                Stock: <strong>{Number(listing.quantityAvailable).toLocaleString('en-IN')} {listing.unit}</strong>
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Order Quantity ({listing.unit})
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                max={listing.quantityAvailable}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Min. order quantity: {listing.minimumOrderQuantity || 1} {listing.unit}
              </p>
            </div>

            {/* Logistics Mode */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Logistics / Fulfillment</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPickupOrDelivery('PICKUP')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    pickupOrDelivery === 'PICKUP'
                      ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  🚜 Self-Pickup from Farm
                </button>
                <button
                  type="button"
                  onClick={() => setPickupOrDelivery('DELIVERY')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    pickupOrDelivery === 'DELIVERY'
                      ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  🚚 Request Delivery (₹50 Fee)
                </button>
              </div>
            </div>

            {pickupOrDelivery === 'DELIVERY' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Processing Plant Delivery Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bio-Compost Unit, Focal Point Phase 2, Ludhiana"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Notes for Farmer (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Will arrive with 5-ton tipper on Saturday 10 AM"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Calculation Breakdown */}
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Material Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {pickupOrDelivery === 'DELIVERY' && (
                <div className="flex justify-between text-stone-600">
                  <span>Logistics / Delivery Fee:</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-900 font-extrabold text-sm pt-1 border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="text-brand-700">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-brand-700 hover:bg-brand-800 text-white transition-colors shadow-md disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                Confirm & Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
