'use client';

import { useEffect, useState } from 'react';
import { api, Order, formatPrice } from '@/lib/api';

export default function TransactionsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await api.getAllOrders(10, page * 10);
      let filteredOrders = result.data;
      
      // Filter by status if not 'all'
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      setOrders(filteredOrders);
      setTotal(result.total);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'waiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'waiting_payment':
        return 'Waiting Payment';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  if (loading && (!orders || orders.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">All Transactions</h1>
        <p className="text-sm text-slate-500">View and manage all orders and payments</p>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="waiting_payment">Waiting Payment</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders && orders.map((order) => (
          <div key={order.id} className="rounded-lg bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex items-start gap-4">
              {order.product?.main_image_url && (
                <img
                  src={order.product.main_image_url}
                  alt={order.product.name}
                  className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                />
              )}
              <div className="flex-1">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {order.product?.name || `Order #${order.id.slice(0, 8)}`}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <span>
                      Customer: <span className="font-medium">{order.user?.name || 'Unknown'}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{order.user?.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-indigo-600">
                      {formatPrice(order.total)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                {order.product?.platforms && order.product.platforms.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {order.product.platforms.map((platform) => (
                      <span
                        key={platform.id}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize"
                      >
                        {platform.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2">
                  Order ID: {order.id} • Created: {new Date(order.created_at).toLocaleString()}
                  {order.duitku_reference && (
                    <> • Duitku Ref: {order.duitku_reference}</>
                  )}
                  {order.license_id && (
                    <> • License: {order.license_id}</>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!orders || orders.length === 0) && !loading && (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">No orders found</p>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
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
      )}
    </div>
  );
}

