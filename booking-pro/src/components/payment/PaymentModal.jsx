import { useState, useEffect } from 'react';
import {
  Shield, Hotel, Moon, CreditCard, Lock, CheckCircle, XCircle,
  ChevronRight, Info,
} from 'lucide-react';
import Modal from '../ui/Modal';
import { Spin, KV } from '../ui/index';
import { useAuth } from '../../hooks/useAuth';
import { callApi } from '../../api/client';
import { PAYMENT_API } from '../../api/config';
import { fmt } from '../../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  PAYMENT MODAL  (Razorpay 3-step: create-order → SDK → verify)
// ─────────────────────────────────────────────────────────────
const PaymentModal = ({ booking, open, onClose, onPaid }) => {
  const { token } = useAuth();
  const [phase,  setPhase]  = useState('confirm'); // confirm | loading | processing | success | failed
  const [result, setResult] = useState(null);
  const [err,    setErr]    = useState('');

  // Reset state each time modal opens/closes
  useEffect(() => {
    if (!open) { setPhase('confirm'); setErr(''); setResult(null); }
  }, [open]);

  // Lazy-load Razorpay SDK
  const loadScript = () => new Promise(res => {
    if (window.Razorpay) return res(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => res(true);
    s.onerror = () => res(false);
    document.head.appendChild(s);
  });

  // Step 1 — create server-side order
  const createOrder = async () => {
    try {
      const d = await callApi(`${PAYMENT_API}/create-order`, {
        method:  'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <-- ADDED: Tells backend to expect JSON
        },
        body:    JSON.stringify({ bookingId: booking.bookingId }),
      });
      return d.data;
    } catch (e) {
      setErr(e.message); setPhase('confirm'); return null;
    }
  };

  // Step 3 — verify HMAC signature
  const verifyPayment = async (resp) => {
    setPhase('loading');
    try {
      const v = await callApi(`${PAYMENT_API}/verify`, {
        method:  'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <-- ADDED: Tells backend to expect JSON
        },
        body:    JSON.stringify({
          razorpayOrderId:   resp.razorpay_order_id,
          razorpayPaymentId: resp.razorpay_payment_id,
          razorpaySignature: resp.razorpay_signature,
        }),
      });
      setResult(v.data);
      setPhase('success');
      onPaid && onPaid(v.data);
    } catch (e) {
      setErr('Verification failed: ' + e.message);
      setPhase('failed');
    }
  };

  // Main handler
  const handlePay = async () => {
    setPhase('loading'); setErr('');

    const loaded = await loadScript();
    if (!loaded) {
      setErr('Payment gateway failed to load. Please try again.');
      setPhase('confirm'); return;
    }

    const ord = await createOrder();
    if (!ord) return;

    setPhase('processing');

    try {
      const rzp = new window.Razorpay({
        key:         ord.razorpayKeyId,
        amount:      ord.amountInPaise,
        currency:    ord.currency || 'INR',
        name:        'BookingPro',
        description: `Booking: ${booking.confirmationCode}`,
        order_id:    ord.razorpayOrderId,
        prefill:     { name: ord.customerName, email: ord.customerEmail, contact: ord.customerPhone },
        theme:       { color: '#003580' },
        modal:       { ondismiss: () => { setPhase('confirm'); setErr('Payment was cancelled.'); } },
        handler:     verifyPayment,
      });
      rzp.on('payment.failed', r => {
        setErr(`Payment failed: ${r.error.description}`); setPhase('failed');
      });
      rzp.open();
    } catch (e) {
      setErr(e.message); setPhase('confirm');
    }
  };

  if (!booking) return null;

  return (
    <Modal open={open} onClose={onClose} title="Complete Payment"
      subtitle={booking.confirmationCode} w="max-w-md">
      <div className="space-y-5">

        {/* Amount hero */}
        <div className="rounded-2xl p-5 text-white"
          style={{ background: 'linear-gradient(135deg,#003580,#0071c2)' }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Amount Due</p>
              <p className="text-4xl font-black mt-1">{fmt.inr(booking.totalAmount)}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-blue-100">
            <span className="flex items-center gap-1.5"><Hotel className="w-3.5 h-3.5" />{booking.hotelName}</span>
            <span className="flex items-center gap-1.5"><Moon  className="w-3.5 h-3.5" />{booking.totalNights}N</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
          <KV k="Room charges"
              v={fmt.inr((booking.selectedRoomPrice || 0) * (booking.numberOfRooms || 1) * (booking.totalNights || 1))} />
          {(booking.totalExtraBedCost || 0) > 0 &&
            <KV k="Extra beds" v={fmt.inr(booking.totalExtraBedCost)} />}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-bold text-gray-900 text-sm">Total</span>
            <span className="font-black text-[#003580]">{fmt.inr(booking.totalAmount)}</span>
          </div>
        </div>

        {/* ── Phase: loading ── */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center py-8 gap-3">
            <Spin cls="w-8 h-8 text-[#003580]" />
            <p className="text-sm text-gray-600 font-medium">Setting up secure payment…</p>
          </div>
        )}

        {/* ── Phase: processing (Razorpay popup is open) ── */}
        {phase === 'processing' && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
              <CreditCard className="w-7 h-7 text-[#003580]" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Processing in payment gateway…</p>
            <p className="text-xs text-gray-400">Do not close this window</p>
          </div>
        )}

        {/* ── Phase: success ── */}
        {phase === 'success' && result && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <h3 className="font-black text-xl text-gray-900">Payment Successful!</h3>
            <p className="text-sm text-gray-500 text-center">
              Your booking is confirmed and payment processed.
            </p>
            <div className="w-full bg-green-50 rounded-xl px-4 py-3 space-y-2">
              <KV k="Payment ID"  v={result.razorpayPaymentId?.slice(-12) || '—'} />
              <KV k="Amount Paid" v={fmt.inr(result.amountInRupees)} />
              <KV k="Status"      v="✓ Success" />
            </div>
            <button onClick={onClose}
              className="w-full py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] transition-colors">
              Done
            </button>
          </div>
        )}

        {/* ── Phase: failed ── */}
        {phase === 'failed' && (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="font-black text-xl text-gray-900">Payment Failed</h3>
            {err && <p className="text-sm text-red-600 text-center">{err}</p>}
            <button onClick={() => { setPhase('confirm'); setErr(''); }}
              className="w-full py-3 border-2 border-[#003580] text-[#003580] font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* ── Phase: confirm ── */}
        {phase === 'confirm' && (
          <>
            {err && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />{err}
              </div>
            )}

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6">
              {[
                { I: Lock,         l: '256-bit SSL'    },
                { I: Shield,       l: 'Razorpay Secure' },
                { I: CheckCircle,  l: 'PCI DSS'        },
              ].map(({ I, l }) => (
                <div key={l} className="flex flex-col items-center gap-1">
                  <I className="w-4 h-4 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">{l}</span>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Accepted Methods</p>
              <div className="flex flex-wrap gap-2">
                {['UPI', 'Cards', 'Net Banking', 'Wallets', 'EMI', 'QR Code'].map(m => (
                  <span key={m} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{m}</span>
                ))}
              </div>
            </div>

            <button onClick={handlePay}
              className="w-full py-4 bg-[#003580] text-white font-black text-base rounded-xl hover:bg-[#00266a] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transition-all group">
              <Lock className="w-4 h-4" />
              Pay Securely — {fmt.inr(booking.totalAmount)}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Redirected to Razorpay's secure checkout. Card details never stored on our servers.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;