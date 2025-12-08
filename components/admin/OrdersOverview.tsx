import React, { useState, useEffect } from 'react';
import { supabase, Order, Profile } from '../../lib/supabase';
import { Package, Search, Filter, Eye, Clock, Truck, CheckCircle, XCircle, Download } from 'lucide-react';
import { JerseySVG } from '../JerseySVG';

const StatusIcon = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock size={14} className="text-yellow-500" />;
    case 'in_production':
      return <Package size={14} className="text-blue-500" />;
    case 'shipped':
      return <Truck size={14} className="text-brand-accent" />;
    case 'completed':
      return <CheckCircle size={14} className="text-green-500" />;
    case 'cancelled':
      return <XCircle size={14} className="text-red-500" />;
  }
};

export const OrdersOverview: React.FC = () => {
  const [orders, setOrders] = useState<(Order & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as any);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Order Number', 'Customer', 'Email', 'Status', 'Total', 'Date'];
    const rows = filteredOrders.map(order => [
      order.order_number,
      order.profile ? `${order.profile.full_name}` : 'Unknown',
      order.profile?.email || '',
      order.status,
      order.total,
      new Date(order.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedOrder) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-neutral-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            ← Back to Orders
          </button>
          <div className="flex gap-2">
            <select
              value={selectedOrder.status}
              onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
              className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-xs text-white focus:border-brand-accent outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_production">In Production</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-black/50 p-6 rounded-xl border border-neutral-800">
              <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-neutral-500 text-xs uppercase">Order Number</p>
                  <p className="text-white font-mono">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs uppercase">Order Date</p>
                  <p className="text-white">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-neutral-500 text-xs uppercase">Customer</p>
                  <p className="text-white">{selectedOrder.shipping_info.firstName} {selectedOrder.shipping_info.lastName}</p>
                  {selectedOrder.shipping_info.organization && (
                    <p className="text-neutral-400 text-xs">{selectedOrder.shipping_info.organization}</p>
                  )}
                </div>
                <div>
                  <p className="text-neutral-500 text-xs uppercase">Shipping Address</p>
                  <p className="text-white">{selectedOrder.shipping_info.address}</p>
                  <p className="text-white">
                    {selectedOrder.shipping_info.city}, {selectedOrder.shipping_info.state} {selectedOrder.shipping_info.zip}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-black/50 p-6 rounded-xl border border-neutral-800">
              <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Design Preview</h3>
              <div className="w-full aspect-[4/5] bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="transform scale-50 origin-center">
                  <JerseySVG design={selectedOrder.design_data} view="front" />
                </div>
              </div>
            </div>

            {selectedOrder.roster_data && selectedOrder.roster_data.length > 0 && (
              <div className="lg:col-span-2 bg-black/50 p-6 rounded-xl border border-neutral-800">
                <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Roster Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-[10px] uppercase font-bold text-neutral-500">
                        <th className="p-3">Size</th>
                        <th className="p-3">Qty</th>
                        {Object.keys(selectedOrder.roster_data[0].dynamicValues || {}).map(key => (
                          <th key={key} className="p-3">{key.replace(/([A-Z])/g, ' $1').trim()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.roster_data.map((entry: any, idx: number) => (
                        <tr key={idx} className="border-b border-neutral-800/50">
                          <td className="p-3 text-white">{entry.size}</td>
                          <td className="p-3 text-white">{entry.quantity}</td>
                          {Object.values(entry.dynamicValues || {}).map((value: any, i: number) => (
                            <td key={i} className="p-3 text-neutral-400">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="lg:col-span-2 bg-black/50 p-6 rounded-xl border border-neutral-800">
              <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm max-w-md">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <span className="text-white">
                    {selectedOrder.shipping_cost === 0 ? 'FREE' : `$${selectedOrder.shipping_cost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-800">
                  <span className="font-bold text-white uppercase">Total</span>
                  <span className="font-display text-xl text-brand-accent italic">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded px-10 py-2 text-sm text-white focus:border-brand-accent outline-none w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-white focus:border-brand-accent outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_production">In Production</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 rounded bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase text-neutral-400 hover:text-brand-accent hover:border-brand-accent transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
            Loading orders...
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package size={48} className="text-neutral-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold uppercase mb-2">No Orders Found</h3>
            <p className="text-neutral-500 text-sm">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No orders have been placed yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-black/50 p-4 rounded-xl border border-neutral-800 hover:border-brand-accent transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-neutral-900 rounded overflow-hidden flex items-center justify-center shrink-0">
                    <div className="transform scale-[0.3] origin-center w-[400px] h-[500px]">
                      <JerseySVG design={order.design_data} view="front" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-bold text-sm">{order.order_number}</h4>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 text-[10px] font-bold uppercase">
                        <StatusIcon status={order.status} />
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      {order.profile?.full_name || 'Unknown'} • {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-brand-accent font-mono text-lg font-bold">${order.total.toFixed(2)}</div>
                    <button className="text-neutral-500 hover:text-brand-accent transition-colors text-[10px] font-bold uppercase flex items-center gap-1">
                      <Eye size={12} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
