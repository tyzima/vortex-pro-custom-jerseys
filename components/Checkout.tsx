import React, { useState, useRef } from 'react';
import { CartItem, RosterEntry } from '../types';
import { Trash2, ArrowRight, CreditCard, ShieldCheck, Truck, ArrowLeft, Edit2, Users, Download, Upload, Plus, AlertCircle } from 'lucide-react';
import { JerseySVG } from './JerseySVG';

interface CheckoutProps {
    cart: CartItem[];
    onRemoveItem: (id: string) => void;
    onEditItem: (id: string) => void;
    onUpdateCartItem: (id: string, item: CartItem) => void;
    onBack: () => void;
}

const RosterTable = ({ item, onUpdate }: { item: CartItem, onUpdate: (roster: RosterEntry[]) => void }) => {
    const dynamicFields = item.design.textElements.filter(t => t.isDynamic);
    const [entries, setEntries] = useState<RosterEntry[]>(item.roster || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateEntry = (index: number, field: string, value: string | number) => {
        const newEntries = [...entries];
        if (field === 'size' || field === 'quantity') {
            (newEntries[index] as any)[field] = value;
        } else {
            newEntries[index].dynamicValues[field] = value as string;
        }
        setEntries(newEntries);
        onUpdate(newEntries);
    };

    const addRow = () => {
        const newEntry: RosterEntry = {
            size: 'L',
            quantity: 1,
            dynamicValues: dynamicFields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
        };
        const newEntries = [...entries, newEntry];
        setEntries(newEntries);
        onUpdate(newEntries);
    };

    const removeRow = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index);
        setEntries(newEntries);
        onUpdate(newEntries);
    };

    const downloadTemplate = () => {
        const headers = ['Size', 'Quantity', ...dynamicFields.map(f => f.id)];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${item.design.textElements.find(t => t.id === 'frontTeam')?.text || 'roster'}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const newEntries: RosterEntry[] = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',').map(v => v.trim());
                const entry: RosterEntry = {
                    size: values[0] || 'L',
                    quantity: parseInt(values[1]) || 1,
                    dynamicValues: {}
                };

                dynamicFields.forEach((field) => {
                    const index = headers.indexOf(field.id);
                    if (index !== -1) {
                        entry.dynamicValues[field.id] = values[index] || '';
                    }
                });
                newEntries.push(entry);
            }

            setEntries(newEntries);
            onUpdate(newEntries);
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-brand-black/30 border border-brand-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-gray rounded overflow-hidden flex items-center justify-center">
                        <div className="transform scale-[0.15] origin-center w-[400px] h-[500px] flex items-center justify-center">
                            <JerseySVG design={item.design} view="front" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-brand-white uppercase">{item.design.textElements.find(t => t.id === 'frontTeam')?.text || 'Team Jersey'}</div>
                        <div className="text-[10px] text-brand-secondary uppercase">{item.design.sport} • {item.design.cut}</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={downloadTemplate} className="flex items-center gap-1 px-3 py-1.5 rounded bg-brand-black border border-brand-border text-[10px] font-bold uppercase text-brand-secondary hover:text-brand-white hover:border-brand-white transition-colors">
                        <Download size={12} /> Template
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-1.5 rounded bg-brand-black border border-brand-border text-[10px] font-bold uppercase text-brand-secondary hover:text-brand-white hover:border-brand-white transition-colors">
                        <Upload size={12} /> Upload CSV
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-brand-border text-[10px] uppercase font-bold text-brand-secondary bg-brand-black/50">
                            <th className="p-3">Size</th>
                            <th className="p-3">Qty</th>
                            {dynamicFields.map(f => (
                                <th key={f.id} className="p-3">{f.id.replace(/([A-Z])/g, ' $1').trim()}</th>
                            ))}
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, idx) => (
                            <tr key={idx} className="border-b border-brand-border/50 hover:bg-white/5 transition-colors">
                                <td className="p-2">
                                    <select
                                        value={entry.size}
                                        onChange={(e) => updateEntry(idx, 'size', e.target.value)}
                                        className="bg-brand-black border border-brand-border rounded p-1.5 text-xs text-brand-white focus:border-brand-accent outline-none w-20"
                                    >
                                        {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={entry.quantity}
                                        onChange={(e) => updateEntry(idx, 'quantity', parseInt(e.target.value))}
                                        className="bg-brand-black border border-brand-border rounded p-1.5 text-xs text-brand-white focus:border-brand-accent outline-none w-16"
                                    />
                                </td>
                                {dynamicFields.map(f => (
                                    <td key={f.id} className="p-2">
                                        <input
                                            type="text"
                                            value={entry.dynamicValues[f.id] || ''}
                                            onChange={(e) => updateEntry(idx, f.id, e.target.value)}
                                            className="bg-brand-black border border-brand-border rounded p-1.5 text-xs text-brand-white focus:border-brand-accent outline-none w-full min-w-[100px]"
                                            placeholder={f.text}
                                        />
                                    </td>
                                ))}
                                <td className="p-2 text-center">
                                    <button onClick={() => removeRow(idx)} className="text-neutral-600 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={addRow} className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase text-brand-secondary hover:text-brand-accent hover:bg-white/5 transition-colors border-t border-brand-border">
                <Plus size={14} /> Add Player
            </button>
        </div>
    );
};

export const Checkout: React.FC<CheckoutProps> = ({ cart, onRemoveItem, onEditItem, onUpdateCartItem, onBack }) => {
    const dynamicItems = cart.filter(item => item.design.textElements.some(t => t.isDynamic));
    const hasDynamicItems = dynamicItems.length > 0;

    // Calculate total quantity from roster entries for dynamic items
    const calculateItemTotal = (item: CartItem) => {
        if (item.design.textElements.some(t => t.isDynamic)) {
            return item.roster?.reduce((acc, entry) => acc + entry.quantity, 0) || 0;
        }
        return item.quantity;
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * calculateItemTotal(item)), 0);
    const shipping = subtotal > 500 ? 0 : 25;
    const total = subtotal + shipping;

    const handleRosterUpdate = (itemId: string, roster: RosterEntry[]) => {
        const item = cart.find(i => i.id === itemId);
        if (item) {
            const totalQty = roster.reduce((acc, r) => acc + r.quantity, 0);
            onUpdateCartItem(itemId, { ...item, roster, quantity: totalQty });
        }
    };

    // Validation
    const isRosterValid = !hasDynamicItems || dynamicItems.every(item =>
        item.roster &&
        item.roster.length > 0 &&
        item.roster.every(entry =>
            item.design.textElements
                .filter(t => t.isDynamic)
                .every(field => entry.dynamicValues[field.id]?.trim())
        )
    );

    return (
        <div className="fixed inset-0 bg-brand-black z-[60] overflow-y-auto pt-24 pb-12 animate-fade-in">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="text-brand-secondary hover:text-brand-white transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Continue Shopping
                    </button>
                    <div className="h-6 w-px bg-brand-border" />
                    <h1 className="font-display text-3xl text-brand-white italic uppercase">Secure Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT: ORDER FORM */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* 1. Shipping */}
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <Truck size={14} /> Shipping Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-secondary uppercase">First Name</label>
                                    <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="Jordan" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-secondary uppercase">Last Name</label>
                                    <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="Poole" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-brand-secondary uppercase">Team / Organization</label>
                                    <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="Golden State Warriors" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-brand-secondary uppercase">Address</label>
                                    <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="1 Warriors Way" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-brand-secondary uppercase">City</label>
                                    <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="San Francisco" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-brand-secondary uppercase">State</label>
                                        <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="CA" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-brand-secondary uppercase">Zip</label>
                                        <input type="text" className="w-full bg-brand-black border border-brand-border rounded p-3 text-brand-white text-sm focus:border-brand-accent outline-none" placeholder="94158" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Roster Details (Conditional) */}
                        {hasDynamicItems && (
                            <div className="bg-brand-card border border-brand-border rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <Users size={120} />
                                </div>
                                <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2 relative z-10">
                                    <Users size={14} /> Roster Details
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <div className={`border rounded-lg p-4 flex items-start gap-3 transition-colors ${isRosterValid ? 'bg-brand-accent/10 border-brand-accent/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <AlertCircle size={16} className={isRosterValid ? "text-brand-accent" : "text-red-500"} />
                                        <p className="text-xs text-brand-secondary leading-relaxed">
                                            {isRosterValid
                                                ? "Roster details look good! You can proceed to payment."
                                                : "Please complete all roster details for your team items to proceed."}
                                        </p>
                                    </div>

                                    {dynamicItems.map(item => (
                                        <RosterTable
                                            key={item.id}
                                            item={item}
                                            onUpdate={(roster) => handleRosterUpdate(item.id, roster)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Payment */}
                        <div className={`bg-brand-card border border-brand-border rounded-2xl p-8 relative overflow-hidden transition-opacity duration-300 ${isRosterValid ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <div className="absolute inset-0 flex items-center justify-center z-10" style={{ display: isRosterValid ? 'none' : 'flex' }}>
                                <div className="bg-brand-black px-4 py-2 rounded border border-brand-border text-xs font-bold uppercase text-brand-secondary">Complete Roster First</div>
                            </div>
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <CreditCard size={14} /> Payment Method
                            </h3>
                            <div className="h-32 bg-brand-black rounded"></div>
                        </div>

                        <button
                            disabled={!isRosterValid}
                            className={`w-full font-bold uppercase tracking-widest py-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(210,248,2,0.2)] ${isRosterValid ? 'bg-brand-accent hover:bg-white text-black' : 'bg-brand-gray text-brand-secondary cursor-not-allowed shadow-none'}`}
                        >
                            <span>Submit Order Request</span>
                            <ArrowRight size={18} />
                        </button>

                        <div className="flex items-center justify-center gap-2 text-brand-secondary text-[10px] uppercase font-bold">
                            <ShieldCheck size={14} className="text-brand-accent" /> Secure Encrypted Transaction
                        </div>
                    </div>

                    {/* RIGHT: ORDER SUMMARY */}
                    <div className="lg:col-span-5">
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 sticky top-24">
                            <h3 className="font-display text-2xl text-brand-white uppercase italic mb-6">Order Manifest</h3>

                            <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12 text-brand-secondary text-sm italic">Your bag is empty.</div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 bg-brand-black/40 p-3 rounded-xl border border-brand-border">
                                            {/* Mini Preview */}
                                            <div className="w-20 h-24 bg-brand-gray rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                                                <div className="transform scale-[0.35] origin-center w-[400px] h-[500px] flex items-center justify-center">
                                                    <JerseySVG design={item.design} view="front" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-brand-white font-bold text-sm uppercase truncate">
                                                            {item.design.textElements?.find(el => el.id === 'frontTeam')?.text || 'Team Jersey'}
                                                        </div>
                                                        <div className="text-brand-secondary text-[10px] font-bold uppercase">{item.design.sport} • {item.design.cut}</div>
                                                    </div>
                                                    <div className="text-brand-white font-mono text-sm">${item.price}</div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    <span className="px-2 py-0.5 bg-brand-gray rounded text-[8px] font-bold uppercase text-brand-secondary">
                                                        {item.design.template}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-brand-gray rounded text-[8px] font-bold uppercase text-brand-secondary">
                                                        Qty: {calculateItemTotal(item)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => onEditItem(item.id)}
                                                    className="text-neutral-600 hover:text-brand-accent transition-colors self-center p-2"
                                                    title="Edit item"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="text-neutral-600 hover:text-red-500 transition-colors self-center p-2"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-brand-border text-sm">
                                <div className="flex justify-between text-brand-secondary">
                                    <span>Subtotal</span>
                                    <span className="font-mono text-brand-white">${subtotal}</span>
                                </div>
                                <div className="flex justify-between text-brand-secondary">
                                    <span>Shipping (Standard)</span>
                                    <span className="font-mono text-brand-white">{shipping === 0 ? 'FREE' : `$${shipping}`}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                                    <span className="font-bold text-brand-white uppercase tracking-widest">Total</span>
                                    <span className="font-display text-3xl text-brand-accent italic">${total}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};