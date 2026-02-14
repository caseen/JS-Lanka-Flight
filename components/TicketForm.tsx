import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, CheckCircle, Calculator, Info, UserPlus, Plane, Plus, AlertTriangle, User } from 'lucide-react';
import { Ticket, Customer, Supplier, Passenger, FlightSegment } from '../types.ts';
import { extractTicketDetails } from '../services/geminiService.ts';
import { supabase } from '../supabaseClient.ts';
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

  const [currentPassenger, setCurrentPassenger] = useState<Passenger>({ name: '', eTicketNo: '', type: 'Adult' });
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
    setCurrentPassenger({ name: '', eTicketNo: '', type: 'Adult' });
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
                <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight">Quick Add {quickAddType}</h3>
                <button type="button" onClick={() => setQuickAddType(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={`${quickAddType === 'customer' ? 'Customer' : 'Supplier'} Name`}
                    value={quickAddData.name}
                    onChange={e => setQuickAddData({...quickAddData, name: e.target.value})}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Info</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  quickAddType === 'customer' ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-orange-500 shadow-orange-100 hover:bg-orange-600'
                } text-white uppercase text-xs tracking-widest`}
              >
                {quickAddLoading ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                Save {quickAddType}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-dashed border-2 border-slate-200">
        <Upload className="text-blue-500 mb-4" size={40} />
        <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-2 tracking-tight">Ticket AI Scanner</h3>
        <p className="text-slate-500 text-xs lg:text-sm mb-6 text-center max-w-sm">
          Upload a ticket to automatically extract PNR, Flights, and Passenger names.
        </p>
        
        <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
          <label className={`w-full sm:w-auto cursor-pointer px-10 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm ${
            loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
          }`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {loading ? 'Analyzing...' : 'Upload Ticket'}
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" disabled={loading} />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <div className="bg-white p-5 lg:p-6 rounded-2xl border shadow-sm space-y-4 lg:space-y-6">
            <h4 className="font-black text-[10px] lg:text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Plane size={18} className="text-blue-500" /> Itinerary Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Airline</label>
                <input type="text" className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" placeholder="e.g. Emirates" value={formData.airline || ''} onChange={e => setFormData({ ...formData, airline: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Booking PNR</label>
                <input type="text" className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase font-mono font-black text-sm" placeholder="Locator" value={formData.pnr || ''} onChange={e => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })} required />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;