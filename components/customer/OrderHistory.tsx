import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import { supabase, Order } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { JerseySVG } from '../JerseySVG';

interface OrderHistoryProps {
  onBack: () => void;
}

const StatusIcon = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} className="text-yellow-500" />;
    case 'in_production':
      return <Package size={16} className="text-blue-500" />;
    case 'shipped':
      return <Truck size={16} className="text-brand-accent" />;
    case 'completed':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'cancelled':
      return <XCircle size={16} className="text-red-500" />;
    default:
      return <Clock size={16} className="text-gray-500" />;
  }
};

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const colors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    in_production: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    shipped: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
    completed: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors[status]} text-[10px] font-bold uppercase`}>
      <StatusIcon status={status} />
      {status.replace('_', ' ')}
    </div>
  );
};

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (selectedOrder) {
    return (
      <div className="fixed inset-0 bg-brand-black z-[60] overflow-y-auto pt-24 pb-12 animate-fade-in">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-brand-secondary hover:text-brand-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Back to Orders
            </button>
          </div>

          <div className="bg-brand-card border border-brand-border rounded-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="font-display text-3xl text-brand-white italic uppercase mb-2">
                  Order {selectedOrder.order_number}
                </h1>
                <p className="text-brand-secondary text-sm">
                  Placed on {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-brand-black/40 p-6 rounded-xl">
                <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Design Preview</h3>
                <div className="w-full aspect-[4/5] bg-brand-gray rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="transform scale-50 origin-center">
                    <JerseySVG design={selectedOrder.design_data} view="front" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-brand-black/40 p-6 rounded-xl">
                  <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-brand-white">{selectedOrder.shipping_info.firstName} {selectedOrder.shipping_info.lastName}</p>
                    {selectedOrder.shipping_info.organization && (
                      <p className="text-brand-secondary">{selectedOrder.shipping_info.organization}</p>
                    )}
                    <p className="text-brand-secondary">{selectedOrder.shipping_info.address}</p>
                    <p className="text-brand-secondary">
                      {selectedOrder.shipping_info.city}, {selectedOrder.shipping_info.state} {selectedOrder.shipping_info.zip}
                    </p>
                  </div>
                </div>

                <div className="bg-brand-black/40 p-6 rounded-xl">
                  <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-brand-secondary">
                      <span>Subtotal</span>
                      <span className="text-brand-white">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-brand-secondary">
                      <span>Shipping</span>
                      <span className="text-brand-white">
                        {selectedOrder.shipping_cost === 0 ? 'FREE' : `$${selectedOrder.shipping_cost.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-brand-border">
                      <span className="font-bold text-brand-white uppercase">Total</span>
                      <span className="font-display text-xl text-brand-accent italic">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.roster_data && selectedOrder.roster_data.length > 0 && (
              <div className="bg-brand-black/40 p-6 rounded-xl">
                <h3 className="text-brand-accent text-xs font-bold uppercase mb-4">Roster Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary">
                        <th className="p-3">Size</th>
                        <th className="p-3">Qty</th>
                        {Object.keys(selectedOrder.roster_data[0].dynamicValues || {}).map(key => (
                          <th key={key} className="p-3">{key.replace(/([A-Z])/g, ' $1').trim()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.roster_data.map((entry: any, idx: number) => (
                        <tr key={idx} className="border-b border-brand-border/50">
                          <td className="p-3 text-brand-white">{entry.size}</td>
                          <td className="p-3 text-brand-white">{entry.quantity}</td>
                          {Object.values(entry.dynamicValues || {}).map((value: any, i: number) => (
                            <td key={i} className="p-3 text-brand-secondary">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-brand-black z-[60] overflow-y-auto pt-24 pb-12 animate-fade-in">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="text-brand-secondary hover:text-brand-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-6 w-px bg-brand-border" />
          <h1 className="font-display text-3xl text-brand-white italic uppercase">My Orders</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-brand-accent text-xl font-bold uppercase tracking-widest animate-pulse">
              Loading orders...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-brand-card border border-brand-border rounded-2xl p-12 text-center">
            <Package size={48} className="text-brand-secondary mx-auto mb-4" />
            <h2 className="text-brand-white text-xl font-bold uppercase mb-2">No Orders Yet</h2>
            <p className="text-brand-secondary text-sm">
              You haven't placed any orders yet. Start designing your custom jerseys!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-brand-card border border-brand-border rounded-xl p-6 hover:border-brand-accent transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-24 bg-brand-gray rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                      <div className="transform scale-[0.35] origin-center w-[400px] h-[500px]">
                        <JerseySVG design={order.design_data} view="front" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-brand-white font-bold uppercase">{order.order_number}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-brand-secondary text-sm mb-2">
                        Placed on {formatDate(order.created_at)}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-brand-gray rounded text-brand-secondary uppercase">
                          {order.design_data.sport}
                        </span>
                        <span className="px-2 py-0.5 bg-brand-gray rounded text-brand-secondary uppercase">
                          {order.design_data.cut}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-brand-white font-mono text-lg font-bold mb-2">
                      ${order.total.toFixed(2)}
                    </div>
                    <button className="flex items-center gap-2 text-brand-accent hover:text-brand-white transition-colors text-xs font-bold uppercase">
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
