import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  User, 
  Edit,
  Download,
  PlaneTakeoff,
  Eye,
  EyeOff,
  Calculator,
  TrendingUp,
  Truck,
  Copy,
  Check,
  Info,
  Zap
} from 'lucide-react';
import { Ticket } from '../types';

interface BookingDetailsProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ ticket, onBack, onEdit }) => {
  const [isLogisticVisible, setIsLogisticVisible] = useState(true);
  const [isFinancialVisible, setIsFinancialVisible] = useState(false);
  const [pnrCopied, setPnrCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const copyPNR = () => {
    navigator.clipboard.writeText(ticket.pnr);
    setPnrCopied(true);
    setTimeout(() => setPnrCopied(false), 2000);
  };

  const ToggleSwitch = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'}`}
    >
      <span 
        className={`absolute h-3 w-3 bg-white rounded-full transition-all duration-200 ${active ? 'left-[18px]' : 'left-[2px]'}`} 
      />
    </button>
  );

  return (
    <div className="min-h-full flex flex-col bg-slate-50/30 animate-fadeIn pb-12">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-booking, #printable-booking * { visibility: visible; }
          #printable-booking {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action Bar - Compact */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-2 no-print shrink-0">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <button 
            onClick={onBack}
            className="group flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-wider"
          >
            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-all">
              <ArrowLeft size={14} />
            </div>
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-700 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 shadow-sm transition-all active:scale-95"
            >
              <Download size={12} className="text-blue-600" /> Print / Export
            </button>
            <button 
              onClick={() => onEdit(ticket)}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Edit size={12} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div id="printable-booking" className="max-w-6xl mx-auto w-full bg-white lg:rounded-b-[2rem] shadow-xl border-x border-b border-slate-100 flex flex-col overflow-hidden">
        
        {/* Header - Very Compact */}
        <div className="bg-slate-900 px-6 py-4 lg:px-8 text-white relative shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-xl ring-2 ring-white/5 shrink-0">
                <Plane className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-black tracking-tighter leading-none uppercase text-white mb-1">{ticket.airline}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/10 rounded-md px-2 py-0.5 border border-white/5">
                    <span className="text-[6.5px] font-black uppercase tracking-widest text-blue-100">PNR: {ticket.pnr}</span>
                    <button onClick={copyPNR} className="ml-1 text-white/30 hover:text-white transition-colors no-print">
                      {pnrCopied ? <Check size={7} className="text-emerald-400" /> : <Copy size={7} />}
                    </button>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-widest border ${
                    ticket.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    ticket.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {ticket.status}
                  </span>
                  {ticket.isDummy && (
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-widest shadow-sm shadow-orange-100 border border-orange-400 flex items-center gap-1 animate-pulse">
                      <Zap size={7} fill="currentColor" /> Dummy
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[6.5px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Issue Date</p>
              <p className="text-[10px] font-black text-white">{ticket.issuedDate}</p>
            </div>
          </div>
        </div>

        {/* Content - Natural hugging layout */}
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          {/* Main Column: Flights Only */}
          <div className="lg:flex-[1.8] p-4 lg:p-6 space-y-4">
            
            {/* Flights Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <PlaneTakeoff size={14} className="text-blue-500" />
                <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Full Itinerary Details</h3>
              </div>
              
              <div className="space-y-3">
                {ticket.segments.map((seg, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <div className="text-left">
                        <p className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter leading-none">{seg.origin}</p>
                        <p className="text-xs font-black text-blue-600 uppercase mt-1 leading-none">{seg.departureTime}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 leading-none">{seg.departureDate}</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-500 mb-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{seg.flightNo || 'Flight'}</span>
                        <div className="w-full flex items-center gap-1.5">
                          <div className="h-px flex-1 bg-slate-200"></div>
                          <Plane size={16} className="text-slate-300" />
                          <div className="h-px flex-1 bg-slate-200"></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl lg:text-2xl font-black text-slate-900 tracking-tighter leading-none">{seg.destination}</p>
                        <p className="text-xs font-black text-blue-600 uppercase mt-1 leading-none">{seg.arrivalTime}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 leading-none">{seg.arrivalDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Side Column: Travelers Section + Logistics & Financials */}
          <div className="lg:flex-1 bg-slate-50/30 p-4 lg:p-6 space-y-5 pb-8 lg:pb-6">
            
            {/* Travelers Section */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-500" />
                <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em]">Travelers</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ticket.passengers.map((p, idx) => (
                  <div key={idx} className="flex flex-col p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-5 h-5 bg-slate-50 rounded flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight break-words leading-tight flex items-center gap-2">
                            {p.name}
                            <span className={`text-[8px] font-black px-1 rounded shrink-0 ${
                                p.type === 'CHD' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 
                                p.type === 'INF' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 
                                'bg-blue-50 text-blue-500 border-blue-100'
                            }`}>
                                {p.type || 'ADT'}
                            </span>
                        </p>
                      </div>
                    </div>
                    {p.eTicketNo && (
                      <div className="mt-1.5 pl-8">
                        <span className="font-mono text-[8px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {p.eTicketNo}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Logistics & Financials Section */}
            <section className="space-y-5 pt-5 border-t border-slate-200">
               {/* Logistics */}
               <div className={`space-y-3 ${!isLogisticVisible ? 'no-print' : ''}`}>
                  <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-orange-500" />
                      <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Logistics</span>
                    </div>
                    <ToggleSwitch active={isLogisticVisible} onToggle={() => setIsLogisticVisible(!isLogisticVisible)} />
                  </div>
                  {isLogisticVisible && (
                    <div className="grid grid-cols-1 gap-1.5 animate-fadeIn">
                      <div className="px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5 leading-none">Agent</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase truncate leading-none">{ticket.customerName || 'Internal'}</p>
                      </div>
                      <div className="px-2.5 py-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5 leading-none">Source</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase truncate leading-none">{ticket.supplierName || 'Direct'}</p>
                      </div>
                    </div>
                  )}
               </div>

               {/* Financials */}
               <div className={`space-y-3 ${!isFinancialVisible ? 'no-print' : ''}`}>
                  <div className="flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                      <Calculator size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Financials</span>
                    </div>
                    <ToggleSwitch active={isFinancialVisible} onToggle={() => setIsFinancialVisible(!isFinancialVisible)} />
                  </div>
                  {isFinancialVisible && (
                    <div className="space-y-1.5 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-center">
                          <p className="text-[6px] font-black text-slate-400 uppercase mb-0.5 leading-none">Cost</p>
                          <p className="text-[10px] font-black text-slate-700 leading-none">{ticket.purchasePrice.toLocaleString()}</p>
                        </div>
                        <div className="px-2 py-1.5 bg-white border border-slate-100 rounded-lg text-center">
                          <p className="text-[6px] font-black text-slate-400 uppercase mb-0.5 leading-none">Price</p>
                          <p className="text-[10px] font-black text-slate-900 leading-none">{ticket.salesPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-2 rounded-lg border flex justify-between items-center ${ticket.profit >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                        <span className="text-[8px] font-black uppercase leading-none">Profit</span>
                        <span className="text-[10px] font-black leading-none">{ticket.profit.toLocaleString()} LKR</span>
                      </div>
                    </div>
                  )}
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;