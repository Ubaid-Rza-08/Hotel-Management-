import { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from "../hooks/useAuth";
import { callApi } from "../api/client";
import { PAYMENT_API } from "../api/config";
import { fmt } from '../utils/fmt';
import { Spin, ErrBox, Empty, StatChip, pmBadge } from '../components/ui/index';

// ─────────────────────────────────────────────────────────────
//  PAYMENTS PAGE
// ─────────────────────────────────────────────────────────────
const PaymentsPage = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [err,      setErr]      = useState('');

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const d = await callApi(`${PAYMENT_API}/my-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(d.data || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const totalPaid  = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + (p.amountInRupees || 0), 0);
  const successCnt = payments.filter(p => p.status === 'SUCCESS').length;
  const failedCnt  = payments.filter(p => p.status === 'FAILED').length;
  const pendingCnt = payments.filter(p => p.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black text-gray-900">Payment History</h1>
          <p className="text-gray-400 text-sm mt-0.5">All your transactions in one place</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <StatChip label="Total Paid"  value={fmt.inr(totalPaid)} color="text-[#003580]"  />
            <StatChip label="Successful"  value={successCnt}         color="text-green-700"  />
            <StatChip label="Failed"      value={failedCnt}          color="text-red-600"    />
            <StatChip label="Pending"     value={pendingCnt}         color="text-yellow-700" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {err     && <ErrBox msg={err} onRetry={load} />}
        {!loading && !err && payments.length === 0 && (
          <Empty icon={CreditCard} title="No transactions yet"
            desc="Payment history appears here after your first booking payment" />
        )}

        {!loading && !err && payments.length > 0 && (
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.paymentId}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-4">
                    {/* Status icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      p.status === 'SUCCESS' ? 'bg-green-50' :
                      p.status === 'FAILED'  ? 'bg-red-50'   : 'bg-yellow-50'
                    }`}>
                      {p.status === 'SUCCESS'
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : p.status === 'FAILED'
                        ? <XCircle    className="w-5 h-5 text-red-500"   />
                        : <CreditCard className="w-5 h-5 text-yellow-500"/>}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-gray-900">{p.receipt || 'Payment'}</span>
                        {pmBadge(p.status)}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">
                        {(p.razorpayPaymentId || p.razorpayOrderId || p.paymentId || '').slice(-16)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmt.dt(p.paidAt || p.createdAt)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xl font-black ${p.status === 'SUCCESS' ? 'text-[#003580]' : 'text-gray-400'}`}>
                      {fmt.inr(p.amountInRupees)}
                    </p>
                    <p className="text-xs text-gray-400">{p.currency || 'INR'}</p>
                  </div>
                </div>

                {p.failureReason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />{p.failureReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
