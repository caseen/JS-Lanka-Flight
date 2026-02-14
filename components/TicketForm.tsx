
import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle, Calculator, Info, UserPlus, Plane, Plus, AlertTriangle, User } from 'lucide-react';
import { Ticket, Customer, Supplier, Passenger, FlightSegment } from '../types';
import { extractTicketDetails } from '../services/geminiService';
import { supabase } from '../supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface TicketFormProps {
  onSave: (ticket: Ticket) => void;
  customers: Customer[];
  suppliers: Supplier[];
  editTicket?: Ticket;
  sessionUser: SupabaseUser;
  onAddCustomer: (customer: Customer) => Promise<Customer | undefined>;
  onAddSupplier: (supplier: Supplier) => Promise<Supplier | undefined>;
}

const TicketForm: React.FC<TicketFormProps> = ({ 
  onSave, 
  customers, 
  suppliers, 
  editTicket, 
  sessionUser,
  onAddCustomer,
  onAddSupplier 
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [quickAddType, setQuickAddType] = useState<'customer' | 'supplier' | null>(null);
  const [quickAddData, setQuickAddData] = useState({ name: '', contact: '' });
  const [quickAddLoading, setQuickAddLoading] = useState(false);
  
  const [stableId] = useState(editTicket?.id || Math.random().toString(36).substr(2, 9));

  const [formData, setFormData] = useState<Partial<Ticket>>({
    id: stableId,
    passengers: editTicket?.passengers || [],
    segments: editTicket?.segments || [],
    pnr: editTicket?.pnr || '',
    issuedDate: editTicket?.issuedDate || new Date().toISOString().split('T')[0],
    airline: editTicket?.airline || '',
    customerName: editTicket?.customerName || '',
    supplierName: editTicket?.supplierName || '',
    salesPrice: editTicket?.salesPrice || 0,
    purchasePrice: editTicket?.purchasePrice || 0,
    profit: editTicket?.profit || 0,
    isDummy: editTicket?.isDummy || false,
    status: editTicket?.status || 'Confirmed',
    reminderSent: editTicket?.reminderSent || false
  });

  const [currentPassenger, setCurrentPassenger] = useState({ name: '', eTicketNo: '' });
  const [currentSegment, setCurrentSegment] = useState<FlightSegment>({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    flightNo: ''
  });

  useEffect(() => {
    if (editTicket) {
      setFormData(editTicket);
    }
  }, [editTicket]);

  useEffect(() => {
    const profit = (formData.salesPrice || 0) - (formData.purchasePrice || 0);
    setFormData(prev => ({ ...prev, profit }));
  }, [formData.salesPrice, formData.purchasePrice]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const storagePath = `${sessionUser.id}/tickets/${stableId}/${fileName}`;

      const { error: supabaseError } = await supabase.storage
        .from('app-files')
        .upload(storagePath, file, { 
          upsert: true, 
          contentType: file.type 
        });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const details = await extractTicketDetails(base64, file.type);
      
      setFormData(prev => ({
        ...prev,
        passengers: details.passengers || prev.passengers,
        segments: details.segments || prev.segments,
        pnr: details.pnr || prev.pnr,
        airline: details.airlineName || prev.airline,
        issuedDate: details.issuedDate || prev.issuedDate,
        ticketFilePath: storagePath
      }));
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddData.name.trim()) return;

    setQuickAddLoading(true);
    try {
      if (quickAddType === 'customer') {
        const added = await onAddCustomer({ name: quickAddData.name, phone: quickAddData.contact } as Customer);
        if (added) setFormData(prev => ({ ...prev, customerName: added.name }));
      } else if (quickAddType === 'supplier') {
        const added = await onAddSupplier({ name: quickAddData.name, contact: quickAddData.contact } as Supplier);
        if (added) setFormData(prev => ({ ...prev, supplierName: added.name }));
      }
      setQuickAddType(null);
      setQuickAddData({ name: '', contact: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setQuickAddLoading(false);
    }
  };

  const addPassenger = () => {
    if (!currentPassenger.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      passengers: [...(prev.passengers || []), { ...currentPassenger }]
    }));
    setCurrentPassenger({ name: '', eTicketNo: '' });
  };

  const addSegment = () => {
    if (!currentSegment.origin || !currentSegment.destination || !currentSegment.departureDate) {
      alert("Please fill flight details");
      return;
    }
    setFormData(prev => ({
      ...prev,
      segments: [...(prev.segments || []), { ...currentSegment }]
    }));
    setCurrentSegment({ origin: '', destination: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '', flightNo: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passengers?.length || !formData.segments?.length) {
      alert("Missing passenger or flight information.");
      return;
    }
    onSave(formData as Ticket);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6 animate-fadeIn pb-12 relative">
      {/* Quick Add Modal */}
      {quickAddType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <form onSubmit={handleQuickAdd} className="p-6 lg:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Quick Add {quickAddType}</h3>
                <button type="button" onClick={() => setQuickAddType(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder={`${quickAddType === 'customer' ? 'Customer' : 'Supplier'} Name`}
                    value={quickAddData.name}
                    onChange={e => setQuickAddData({...quickAddData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Info</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="Phone or Contact Detail"
                    value={quickAddData.contact}
                    onChange={e => setQuickAddData({...quickAddData, contact: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={quickAddLoading}
                className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                  quickAddType === 'customer' ? 'bg-blue-600 shadow-blue-100' : 'bg-orange-500 shadow-orange-100'
                } text-white`}
              >
                {quickAddLoading ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                Save {quickAddType}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Scanner Section */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-dashed border-2 border-slate-200">
        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <Upload className="text-blue-500" size={32} />
        </div>
        <h3 className="text-base lg:text-lg font-black text-slate-800 mb-1">Ticket AI Scanner</h3>
        <p className="text-slate-500 text-xs mb-6 text-center max-w-[280px] lg:max-w-sm font-medium">
          Upload an e-ticket or photo to automatically extract PNR, segments, and passengers.
        </p>
        
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
          <label className={`w-full sm:w-auto cursor-pointer px-8 py-3 rounded-full font-black transition-all flex items-center justify-center gap-2 text-sm ${
            loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
          }`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={18} />}
            {loading ? 'Analyzing Data...' : 'Scan Now'}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" disabled={loading} />
          </label>
          
          {uploadError && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl max-w-sm animate-shake">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase mb-1">
                <AlertTriangle size={14} /> Extraction Error
              </div>
              <p className="text-[11px] text-rose-500 leading-relaxed font-medium">{uploadError}</p>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Main Details */}
          <div className="bg-white p-5 lg:p-6 rounded-2xl border shadow-sm space-y-4 lg:space-y-6">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Plane size={18} className="text-blue-500" /> Flight Itinerary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Airline</label>
                <input type="text" className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-base font-bold" placeholder="e.g. Emirates" value={formData.airline || ''} onChange={e => setFormData({ ...formData, airline: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Booking PNR</label>
                <input type="text" className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 text-base uppercase font-mono font-black" placeholder="Locator Code" value={formData.pnr || ''} onChange={e => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })} required />
              </div>
            </div>

            <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <input type="text" className="border rounded-xl p-3 uppercase font-bold text-sm" placeholder="Origin" value={currentSegment.origin} onChange={e => setCurrentSegment({...currentSegment, origin: e.target.value.toUpperCase()})} />
                <input type="text" className="border rounded-xl p-3 uppercase font-bold text-sm" placeholder="Dest" value={currentSegment.destination} onChange={e => setCurrentSegment({...currentSegment, destination: e.target.value.toUpperCase()})} />
                <input type="text" className="col-span-2 sm:col-span-1 border rounded-xl p-3 uppercase font-bold text-sm" placeholder="Flight #" value={currentSegment.flightNo} onChange={e => setCurrentSegment({...currentSegment, flightNo: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase px-1">Departure</p>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 border rounded-xl p-2.5 text-xs font-bold" value={currentSegment.departureDate} onChange={e => setCurrentSegment({...currentSegment, departureDate: e.target.value})} />
                    <input type="time" className="border rounded-xl p-2.5 text-xs font-bold" value={currentSegment.departureTime} onChange={e => setCurrentSegment({...currentSegment, departureTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase px-1">Arrival</p>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 border rounded-xl p-2.5 text-xs font-bold" value={currentSegment.arrivalDate} onChange={e => setCurrentSegment({...currentSegment, arrivalDate: e.target.value})} />
                    <input type="time" className="border rounded-xl p-2.5 text-xs font-bold" value={currentSegment.arrivalTime} onChange={e => setCurrentSegment({...currentSegment, arrivalTime: e.target.value})} />
                  </div>
                </div>
              </div>
              <button type="button" onClick={addSegment} className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-[0.98]">Add to Itinerary</button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {formData.segments?.map((seg, i) => (
                <div key={i} className="flex items-center justify-between bg-white border p-3 rounded-xl shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-700 text-sm">{seg.origin} → {seg.destination} <span className="text-blue-500 ml-1 text-xs">({seg.flightNo})</span></div>
                    <div className="text-[10px] text-slate-400 font-bold">{seg.departureDate} @ {seg.departureTime}</div>
                  </div>
                  <button type="button" className="p-2 text-rose-400 hover:text-rose-600 shrink-0" onClick={() => setFormData({ ...formData, segments: formData.segments?.filter((_, idx) => idx !== i) })}><X size={18} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Passengers */}
          <div className="bg-white p-5 lg:p-6 rounded-2xl border shadow-sm">
             <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-6">
               <UserPlus size={18} className="text-blue-500" /> Passengers
             </h4>
             <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input type="text" className="flex-1 border rounded-xl p-3 text-sm font-bold" placeholder="Full Name" value={currentPassenger.name} onChange={e => setCurrentPassenger({ ...currentPassenger, name: e.target.value })} />
                <input type="text" className="flex-1 border rounded-xl p-3 text-sm font-mono font-bold" placeholder="E-Ticket #" value={currentPassenger.eTicketNo} onChange={e => setCurrentPassenger({ ...currentPassenger, eTicketNo: e.target.value })} />
                <button type="button" onClick={addPassenger} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700">Add</button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.passengers?.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 p-3 lg:p-4 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <div className="text-xs lg:text-sm font-black text-slate-800 truncate">{p.name}</div>
                      <div className="text-[10px] font-mono font-black text-slate-400 truncate tracking-tighter">{p.eTicketNo || 'ETKT PENDING'}</div>
                    </div>
                    <button type="button" className="p-1 text-rose-400 shrink-0" onClick={() => setFormData({ ...formData, passengers: formData.passengers?.filter((_, idx) => idx !== i) })}><X size={16} /></button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4 lg:space-y-6">
          <div className="bg-white p-5 lg:p-6 rounded-2xl border shadow-sm space-y-4">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Info size={18} className="text-orange-500" /> Logistics
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Customer / Agent</label>
                <div className="flex gap-2">
                  <select className="flex-1 border rounded-xl p-3 bg-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none truncate" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} required>
                    <option value="">Select Agent</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setQuickAddType('customer')} className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
                    <Plus size={20}/>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Supplier</label>
                <div className="flex gap-2">
                  <select className="flex-1 border rounded-xl p-3 bg-white text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none truncate" value={formData.supplierName} onChange={e => setFormData({ ...formData, supplierName: e.target.value })} required>
                    <option value="">Select Source</option>
                    {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setQuickAddType('supplier')} className="p-3 bg-orange-500 text-white rounded-xl shadow-md shrink-0">
                    <Plus size={20}/>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Dummy Booking</span>
                <input type="checkbox" className="w-5 h-5 accent-orange-500 rounded" checked={formData.isDummy} onChange={e => setFormData({...formData, isDummy: e.target.checked})} />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl border shadow-sm space-y-4">
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Calculator size={18} className="text-emerald-500" /> Financials
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Purchase (LKR)</p>
                <input type="number" className="w-full border rounded-xl p-3 text-sm font-bold" placeholder="0" value={formData.purchasePrice || ''} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} required />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Sales (LKR)</p>
                <input type="number" className="w-full border rounded-xl p-3 text-sm font-bold" placeholder="0" value={formData.salesPrice || ''} onChange={e => setFormData({ ...formData, salesPrice: Number(e.target.value) })} required />
              </div>
            </div>
            <div className={`p-4 rounded-xl border font-black flex justify-between items-center ${
              (formData.profit || 0) >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <span className="text-[10px] uppercase tracking-tighter">Profit</span>
              <span className="text-lg">{(formData.profit || 0).toLocaleString()} LKR</span>
            </div>
          </div>

          <button type="submit" className="w-full py-4 lg:py-5 bg-blue-600 text-white rounded-3xl font-black text-lg lg:text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 sticky bottom-4">
            {editTicket ? 'Update Record' : 'Save Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
