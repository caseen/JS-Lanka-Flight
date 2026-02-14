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

      const details = await extractTicketDetails(base64, file.type);
      
      setFormData(prev => ({
        ...prev,
        passengers: details.passengers || prev.passengers,
        segments: details.segments || prev.segments,
        pnr: details.pnr || prev.pnr,
        airline: details.airlineName || prev.airline,
        issuedDate: details.issuedDate || prev.issuedDate
      }));
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setLoading(false);
      e.target.value = '';
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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center border-dashed border-2 border-slate-200">
        <Upload className="text-blue-500 mb-4" size={40} />
        <h3 className="text-lg font-bold text-slate-800 mb-2">Ticket AI Scanner</h3>
        <label className={`cursor-pointer px-10 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-sm ${
          loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
        }`}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          {loading ? 'Analyzing...' : 'Upload Ticket'}
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" disabled={loading} />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b pb-4">
              <Plane size={18} className="text-blue-500" /> Itinerary Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" className="w-full border rounded-xl p-3" placeholder="Airline" value={formData.airline || ''} onChange={e => setFormData({ ...formData, airline: e.target.value })} required />
              <input type="text" className="w-full border rounded-xl p-3 uppercase" placeholder="Booking PNR" value={formData.pnr || ''} onChange={e => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })} required />
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input type="text" className="border rounded-lg p-2.5 uppercase text-xs font-bold" placeholder="Origin" value={currentSegment.origin} onChange={e => setCurrentSegment({...currentSegment, origin: e.target.value.toUpperCase()})} />
                <input type="text" className="border rounded-lg p-2.5 uppercase text-xs font-bold" placeholder="Dest" value={currentSegment.destination} onChange={e => setCurrentSegment({...currentSegment, destination: e.target.value.toUpperCase()})} />
                <input type="text" className="border rounded-lg p-2.5 uppercase text-xs font-bold" placeholder="Flight #" value={currentSegment.flightNo} onChange={e => setCurrentSegment({...currentSegment, flightNo: e.target.value.toUpperCase()})} />
              </div>
              <button type="button" onClick={addSegment} className="w-full bg-slate-800 text-white py-3 rounded-xl font-black text-xs uppercase">Add Segment</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
            <h4 className="font-black text-xs text-slate-800 uppercase tracking-widest border-b pb-4">Financials</h4>
            <input type="number" className="w-full border rounded-xl p-3" placeholder="Purchase Price" value={formData.purchasePrice || ''} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} required />
            <input type="number" className="w-full border rounded-xl p-3" placeholder="Sales Price" value={formData.salesPrice || ''} onChange={e => setFormData({ ...formData, salesPrice: Number(e.target.value) })} required />
            <div className="p-4 rounded-xl border font-black flex justify-between items-center bg-emerald-50 text-emerald-700">
              <span className="text-[10px] uppercase">Profit</span>
              <span>{(formData.profit || 0).toLocaleString()} LKR</span>
            </div>
          </div>
          <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl hover:bg-blue-700">Save Booking</button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;