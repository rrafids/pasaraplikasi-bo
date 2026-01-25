'use client';

import { useEffect, useState } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { api, Order, formatPrice, Product, User } from '@/lib/api';

export default function LicensesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRedeemed, setFilterRedeemed] = useState<'all' | 'redeemed' | 'not_redeemed'>('all');
  const itemsPerPage = 10;

  // Create license modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formProductId, setFormProductId] = useState('');
  const [formUserId, setFormUserId] = useState('');
  const [formTotal, setFormTotal] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [page, filterRedeemed, search]);

  useEffect(() => {
    if (showCreateModal && products.length === 0 && users.length === 0) {
      (async () => {
        try {
          const [pRes, uRes] = await Promise.all([
            api.getProducts(200, 0, '', '', ''),
            api.getUsers(200, 0),
          ]);
          setProducts(pRes.data || []);
          setUsers(uRes.data || []);
        } catch (e: any) {
          setCreateError(e.message || 'Failed to load products and users');
        }
      })();
    }
  }, [showCreateModal, products.length, users.length]);

  const openCreateModal = () => {
    setShowCreateModal(true);
    setFormProductId('');
    setFormUserId('');
    setFormTotal('');
    setCreateError(null);
    setCreatedOrder(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreating(false);
    setCreateError(null);
    setCreatedOrder(null);
    loadOrders();
  };

  const handleCreateLicense = async () => {
    if (!formProductId || !formUserId) {
      setCreateError('Please select a product and a user');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      let total: number | undefined;
      if (formTotal.trim() !== '') {
        const n = parseFloat(formTotal);
        total = Number.isNaN(n) ? undefined : n;
      }
      const order = await api.createLicense(formProductId, formUserId, total);
      setCreatedOrder(order);
      if (order.license_id) {
        navigator.clipboard.writeText(order.license_id);
      }
    } catch (e: any) {
      setCreateError(e.message || 'Failed to create license');
    } finally {
      setCreating(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const result = await api.getPaidOrders(itemsPerPage, page * itemsPerPage);
      let filteredOrders = result.data;

      // Filter by redeemed status
      if (filterRedeemed === 'redeemed') {
        filteredOrders = filteredOrders.filter(order => order.license_redeemed === true);
      } else if (filterRedeemed === 'not_redeemed') {
        filteredOrders = filteredOrders.filter(order => order.license_redeemed === false);
      }

      // Filter by search
      if (search) {
        const searchLower = search.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.license_id?.toLowerCase().includes(searchLower) ||
          order.product?.name.toLowerCase().includes(searchLower) ||
          order.user?.name.toLowerCase().includes(searchLower) ||
          order.user?.email.toLowerCase().includes(searchLower)
        );
      }

      setOrders(filteredOrders);
      setTotal(result.total);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRedeemed = async (orderId: string, currentStatus: boolean) => {
    try {
      await api.updateLicenseRedeemed(orderId, !currentStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('License ID copied to clipboard!');
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">License Management</h1>
          <p className="text-sm text-slate-500">Manage paid applications and their license keys</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          Create License
        </button>
      </div>

      {/* Create License Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {createdOrder ? 'License Created' : 'Create License'}
            </h2>
            {createdOrder ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">License ID has been copied to your clipboard.</p>
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                  <div className="text-xs font-medium text-slate-500 mb-1">License ID</div>
                  <div className="text-sm font-mono text-slate-900 break-all">{createdOrder.license_id}</div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => copyToClipboard(createdOrder.license_id || '')}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Copy again
                  </button>
                  <button
                    onClick={closeCreateModal}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                    <select
                      value={formProductId}
                      onChange={(e) => setFormProductId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                    <select
                      value={formUserId}
                      onChange={(e) => setFormUserId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total (optional, 0 = complimentary)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formTotal}
                      onChange={(e) => setFormTotal(e.target.value)}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  {createError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                      {createError}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={closeCreateModal}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLicense}
                    disabled={creating}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by license ID, product, user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterRedeemed}
          onChange={(e) => {
            setFilterRedeemed(e.target.value as 'all' | 'redeemed' | 'not_redeemed');
            setPage(0);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Licenses</option>
          <option value="redeemed">Redeemed</option>
          <option value="not_redeemed">Not Redeemed</option>
        </select>
      </div>

      {/* Orders Grid */}
      {!orders || orders.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-500">No licenses found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg bg-white p-5 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {order.product?.name || 'Unknown Product'}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-600">
                            Customer: <span className="font-medium">{order.user?.name || 'Unknown'}</span>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-sm text-slate-600">
                            {order.user?.email || 'No email'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-indigo-600 mb-1">
                          {formatPrice(order.total)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* License ID */}
                    <div className="mb-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-500 mb-1">License ID</div>
                          <div className="text-sm font-mono text-slate-900 break-all">
                            {order.license_id || 'No license ID'}
                          </div>
                        </div>
                        {order.license_id && (
                          <button
                            onClick={() => copyToClipboard(order.license_id!)}
                            className="flex-shrink-0 rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50 transition-colors"
                            title="Copy license ID"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4 text-slate-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Platforms */}
                    {order.product?.platforms && order.product.platforms.length > 0 && (
                      <div className="mb-3 flex items-center gap-1.5 flex-wrap">
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

                    {/* Status */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Status:</span>
                        {order.license_redeemed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            <CheckCircleIcon className="h-4 w-4" />
                            Redeemed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            <XCircleIcon className="h-4 w-4" />
                            Not Redeemed
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleRedeemed(order.id, order.license_redeemed || false)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          order.license_redeemed
                            ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {order.license_redeemed ? 'Mark as Not Redeemed' : 'Mark as Redeemed'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
              Page {page + 1} of {Math.ceil(total / itemsPerPage)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * itemsPerPage >= total}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

