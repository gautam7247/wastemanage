import React, { useState } from 'react';
import { paymentsApi, ordersApi } from '../api/apiService';
import { unwrap } from '../api/client';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export const CheckoutModal = ({ order, isOpen, onClose, onNotify, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('recycler@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  if (!isOpen || !order) return null;

  const totalAmount = Number(order.totalAmount) || 0;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const checkout = unwrap(
        await paymentsApi.checkout(order.id, {
          paymentMethod,
        })
      );

      if (paymentMethod !== 'CASH_ON_PICKUP' && checkout?.providerOrderId) {
        await paymentsApi.confirmSandbox({
          eventId: 'evt_' + Date.now(),
          eventType: 'payment.successful',
          providerOrderId: checkout.providerOrderId,
          providerTransactionId: 'txn_' + Date.now(),
          amount: checkout.amount,
          currency: checkout.currency || 'INR',
          status: 'SUCCESS',
          timestamp: Date.now(),
        });
      }

      let status = null;
      try {
        status = unwrap(await paymentsApi.getStatus(order.id));
      } catch {
        status = {
          paymentMethod,
          paymentStatus: paymentMethod === 'CASH_ON_PICKUP' ? 'PENDING' : 'SUCCESS',
          providerOrderId: checkout?.providerOrderId,
        };
      }

      setPaymentResult({ ...checkout, ...status });
      onNotify(
        paymentMethod === 'CASH_ON_PICKUP'
          ? 'Cash-on-pickup recorded. Pay the farmer at the farm gate.'
          : 'Sandbox payment confirmed via webhook.',
        'success'
      );
      if (onPaymentSuccess) onPaymentSuccess(status || checkout);
    } catch (err) {
      setError(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    setLoading(true);
    try {
      await ordersApi.complete(order.id);
      onNotify(`Order #${order.id} marked completed.`, 'success');
      onClose();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-brand-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-brand-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ReLoop Secure Sandbox Pay</h3>
              <p className="text-xs text-brand-200">Order #{order.id} • Escrow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {paymentResult ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-extrabold text-stone-900">Payment recorded</h4>
              <p className="text-xs text-stone-600">
                Amount ₹{totalAmount.toFixed(2)} via {paymentResult.paymentMethod || paymentMethod}.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs font-mono space-y-1">
                <div>
                  <span className="text-stone-500">Transaction:</span>{' '}
                  {paymentResult.providerTransactionId || 'Pending cash'}
                </div>
                <div>
                  <span className="text-stone-500">Gateway ref:</span>{' '}
                  {paymentResult.providerOrderId || 'ORD_' + order.id}
                </div>
                <div>
                  <span className="text-stone-500">Status:</span>{' '}
                  <span className="font-bold text-emerald-700">{paymentResult.paymentStatus || 'SUCCESS'}</span>
                </div>
              </div>
              {order.orderStatus === 'ACCEPTED' && (
                <button
                  onClick={handleCompleteOrder}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold"
                >
                  {loading ? 'Updating…' : 'Mark order completed'}
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand-50/70 border border-brand-200">
                <div>
                  <p className="text-xs font-semibold text-stone-600">Total payable</p>
                  <p className="text-xs text-stone-500">Farmer: {order.supplierName || 'Farmer'}</p>
                </div>
                <span className="text-xl font-black text-brand-900">₹{totalAmount.toFixed(2)}</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">Payment method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', Icon: QrCode },
                    { id: 'CARD', label: 'Debit / Card', Icon: CreditCard },
                    { id: 'CASH_ON_PICKUP', label: 'Cash pickup', Icon: Banknote },
                  ].map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex flex-col items-center p-2.5 rounded-xl border text-xs font-bold ${
                        paymentMethod === id
                          ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-brand-600" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">UPI VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Card number (sandbox)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}

              {paymentMethod === 'CASH_ON_PICKUP' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  Cash is paid to the farmer after weight verification at the farm gate.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-md disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Pay ₹{totalAmount.toFixed(2)}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
