'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api, Payment } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await api.getPendingPayments(10, page * 10);
      setPayments(result.data);
      setTotal(result.total);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.approvePayment(id, status);
      await loadPayments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pending Payments</h1>
        <p className="text-sm text-slate-500">Review and approve payment requests</p>
      </div>

      <div className="space-y-4">
        {payments && payments.map((payment) => (
          <div key={payment.id} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {payment.transfer_proof && (
                <img
                  src={payment.transfer_proof}
                  alt="Transfer proof"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment #{payment.id}
                  </h3>
                  {payment.order && (
                    <>
                      <p className="text-sm text-slate-600">
                        Order: {payment.order.product?.name || `Order #${payment.order_id}`}
                      </p>
                      <p className="text-sm text-slate-600">
                        User: {payment.order.user?.name || payment.order.user_id}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        Amount: ${payment.order.total}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      payment.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(payment.id, 'approved')}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <CheckIcon className="h-5 w-5" />
                  Approve
                </button>
                <button
                  onClick={() => handleApprove(payment.id, 'rejected')}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!payments || payments.length === 0) && (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">No pending payments</p>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-slate-700">
          Page {page + 1} of {Math.ceil(total / 10)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={(page + 1) * 10 >= total}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
