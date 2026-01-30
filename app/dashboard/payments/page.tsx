'use client';

import { useEffect, useState } from 'react';
import { api, Payment, formatPrice } from '@/lib/api';
import { DocumentCheckIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    loadPayments();
  }, [page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const result = await api.getPendingPayments(limit, page * limit);
      setPayments(result.data || []);
      setTotal(result.total || 0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActioningId(id);
      await api.approvePayment(id, 'approved');
      await loadPayments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak verifikasi pembayaran ini?')) return;
    try {
      setActioningId(id);
      await api.approvePayment(id, 'rejected');
      await loadPayments();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActioningId(null);
    }
  };

  const isPdf = (url: string) =>
    url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf');

  if (loading && (!payments || payments.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Verify manual transfer</h1>
        <p className="text-sm text-slate-500">
          Review bukti transfer dan setujui atau tolak pembayaran
        </p>
      </div>

      {(!payments || payments.length === 0) ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm border border-slate-200">
          <DocumentCheckIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">Tidak ada pembayaran menunggu verifikasi</p>
          <p className="text-sm text-slate-500 mt-1">Semua bukti transfer sudah diverifikasi</p>
        </div>
      ) : (
        <div className="space-y-6">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order & customer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      {payment.order?.product?.main_image_url && (
                        <img
                          src={payment.order.product.main_image_url}
                          alt={payment.order.product.name}
                          className="h-20 w-20 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {payment.order?.product?.name || `Order #${payment.order_id?.slice(0, 8)}`}
                        </h3>
                        <div className="mt-1 text-sm text-slate-600">
                          <span className="font-medium">{payment.order?.user?.name || '—'}</span>
                          <span className="text-slate-400 mx-2">•</span>
                          <span>{payment.order?.user?.email || '—'}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-bold text-indigo-600">
                            {payment.order ? formatPrice(payment.order.total) : '—'}
                          </span>
                          <span className="text-xs text-slate-500">
                            Order ID: {payment.order_id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Uploaded: {new Date(payment.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transfer proof preview */}
                  <div className="lg:w-80 flex-shrink-0">
                    <p className="text-sm font-medium text-slate-700 mb-2">Bukti transfer</p>
                    {payment.transfer_proof ? (
                      isPdf(payment.transfer_proof) ? (
                        <a
                          href={payment.transfer_proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-4 rounded-lg border-2 border-slate-200 bg-slate-50 hover:bg-slate-100"
                        >
                          <span className="text-red-500 font-medium">PDF</span>
                          <span className="text-sm text-slate-600">Buka file</span>
                        </a>
                      ) : (
                        <a
                          href={payment.transfer_proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50"
                        >
                          <img
                            src={payment.transfer_proof}
                            alt="Bukti transfer"
                            className="w-full h-40 object-contain"
                          />
                          <span className="block py-2 text-center text-xs text-slate-500 border-t border-slate-200">
                            Klik untuk memperbesar
                          </span>
                        </a>
                      )
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center text-slate-400 text-sm">
                        No file
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleApprove(payment.id)}
                    disabled={actioningId === payment.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {actioningId === payment.id ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                    ) : (
                      <DocumentCheckIcon className="h-5 w-5" />
                    )}
                    Setujui
                  </button>
                  <button
                    onClick={() => handleReject(payment.id)}
                    disabled={actioningId === payment.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white text-red-700 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-700">
            Page {page + 1} of {Math.ceil(total / limit) || 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * limit >= total}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
