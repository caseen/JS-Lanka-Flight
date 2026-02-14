
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Calendar, 
  User, 
  Edit,
  ArrowRight,
  Download,
  Info,
  Briefcase,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  MapPin,
  Eye,
  EyeOff,
  Calculator,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Ticket } from '../types';

interface BookingDetailsProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ ticket, onBack, onEdit }) => {
  const [isAdminVisible, setIsAdminVisible] = useState(true);
  const [isFinancialVisible, setIsFinancialVisible] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const segmentCount = ticket.segments.length;
  const isHighDensity = segmentCount > 2;

  return (
    <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-100px)] flex flex-col animate-fadeIn overflow-hidden">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-booking, #printable-booking * {
            visibility: visible;
          }
          #printable-booking {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        .airport-glow {
          text-shadow: 0 0 15px rgba(59, 130, 246, 0.08);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-2 no-print shrink-0 px-1 lg:px-2">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-all font-bold text-xs lg:text-sm"
        >
          <div className="p-1 lg:p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
            <ArrowLeft size={14} />
          </div>
          Back
        </button>
        <div className="flex gap-1.5 lg:gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-white text-slate-700 rounded-lg font-black text-[10px] lg:text-[11px] uppercase tracking-widest hover:bg-slate-50 border border-slate-200 shadow-sm transition-all active:scale-95"
          >
            <Download size={12} className="text-blue-600" /> Export
          </button>
          <button 
            onClick={() => onEdit(ticket)}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-blue-600 text-white rounded-lg font-black text-[10px] lg:text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Edit size={12} /> Edit
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div id="printable-booking" className="flex-1 flex flex-col bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-0">
        
        {/* Brand Header */}
        <div className="bg-slate-900 px-4 lg:px-6 py-3 lg:py-4 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-row justify-between items-center">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-1.5 lg:p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg">
                <Plane className="text-white" size={20} lg:size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base lg:text-xl font-black tracking-tight leading-none uppercase truncate max-w-[120px] lg:max-w-none">{ticket.airline}</h1>
                <div className="flex items-center gap-1.5 lg:gap-2 mt-1.5">
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-blue-200 border border-white/10">
                    PNR: {ticket.pnr}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] lg:text-[10px] font-black uppercase tracking-wider border ${
                    ticket.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    ticket.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Issued</p>
              <p className="text-xs lg:text-sm font-black">{ticket.issuedDate}</p>
              {ticket.isDummy && (
                <div className="mt-1 px-1 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded no-print">
                  DUMMY
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          
          {/* Left Panel: Flight Journey */}
          <div className="flex-[1.5] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100 min-h-0 bg-white">
             <div className="px-4 lg:px-6 py-2 lg:py-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff size={14} className="text-blue-500" />
                  <h3 className="text-[11px] lg:text-xs font-black text-slate-800 uppercase tracking-widest">Flight Journey</h3>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase bg-white px-1.5 py-0.5 rounded border border-slate-100">
                     {segmentCount} Leg{segmentCount > 1 ? 's' : ''}
                   </span>
                </div>
             </div>
             
             <div className="flex-1 flex flex-col p-2 lg:p-4 justify-around min-h-0 overflow-hidden bg-slate-50/5">
                {ticket.segments.map((seg, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-center max-h-[160px] relative min-h-0">
                    <div className={`group relative flex flex-row items-center gap-2 lg:gap-6 p-2 lg:p-5 rounded-xl lg:rounded-2xl bg-white border border-slate-100 hover:border-blue-200 transition-all shadow-sm ${isHighDensity ? 'py-2 lg:py-3' : 'py-3 lg:py-6'}`}>
                       
                       {/* Left: Origin */}
                       <div className="flex-1 text-left min-w-0">
                          <h4 className={`font-black text-slate-900 airport-glow truncate ${isHighDensity ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-4xl'}`}>
                            {seg.origin}
                          </h4>
                          <p className="text-[8px] lg:text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none mt-1">DEP</p>
                          <div className="mt-2 space-y-0.5">
                             <div className="flex items-center gap-1.5">
                                <Clock size={10} className="text-slate-400" />
                                <p className="text-xs lg:text-sm font-black text-slate-800 leading-none">{seg.departureTime}</p>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 leading-none">{seg.departureDate}</p>
                          </div>
                       </div>

                       {/* Center: Flight Connection */}
                       <div className="flex-1 flex flex-col items-center justify-center py-0 shrink-0">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] lg:text-[9px] font-black tracking-widest border border-blue-100 uppercase mb-1.5">
                            {seg.flightNo}
                          </span>
                          
                          <div className="w-full h-[1px] bg-slate-100 relative rounded-full">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-0.5 lg:p-1.5 bg-white border border-slate-50 rounded-full z-10">
                                <Plane size={14} className="text-blue-400 transform rotate-45" />
                             </div>
                          </div>
                          
                          <span className="text-[8px] lg:text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 text-center">Direct Flight</span>
                       </div>

                       {/* Right: Destination */}
                       <div className="flex-1 text-right min-w-0">
                          <h4 className={`font-black text-slate-900 airport-glow truncate ${isHighDensity ? 'text-xl lg:text-2xl' : 'text-2xl lg:text-4xl'}`}>
                            {seg.destination}
                          </h4>
                          <p className="text-[8px] lg:text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none mt-1">ARR</p>
                          <div className="mt-2 space-y-0.5">
                             <div className="flex items-center justify-end gap-1.5">
                                <p className="text-xs lg:text-sm font-black text-slate-800 leading-none">{seg.arrivalTime}</p>
                                <Clock size={10} className="text-slate-400" />
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 leading-none">{seg.arrivalDate}</p>
                          </div>
                       </div>
                    </div>
                    
                    {idx < segmentCount - 1 && (
                      <div className="h-2 flex items-center justify-center -my-1 shrink-0 opacity-10">
                         <div className="w-px h-full border-l border-dashed border-slate-900"></div>
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>

          {/* Right Panel: Passengers, Financials & Admin */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40">
             
             {/* Traveler List */}
             <div className="flex flex-col flex-[1.2] border-b border-slate-100 min-h-0">
                <div className="px-4 lg:px-6 py-2 lg:py-3 border-b border-slate-50 bg-slate-50 flex items-center gap-2 shrink-0">
                  <User size={14} className="text-blue-500" />
                  <h3 className="text-[11px] lg:text-xs font-black text-slate-800 uppercase tracking-widest">Travelers</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-2 lg:space-y-3">
                   {ticket.passengers.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 lg:p-3 bg-white rounded-lg lg:rounded-xl border border-slate-100 shadow-sm">
                         <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                            <div className="w-6 h-6 lg:w-7 lg:h-7 bg-blue-50 rounded-md flex items-center justify-center text-[10px] lg:text-[11px] text-blue-600 font-black shrink-0 border border-blue-100">
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs lg:text-sm font-black text-slate-800 uppercase truncate leading-tight">
                                {p.name} {p.type && p.type !== 'Adult' && <span className="text-blue-600 font-black ml-1 uppercase">({p.type})</span>}
                              </p>
                              {p.eTicketNo && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mt-1">Cleared</p>}
                            </div>
                         </div>
                         {p.eTicketNo && (
                           <div className="text-right ml-2 shrink-0">
                              <p className="text-[8px] lg:text-[9px] font-black text-blue-500 uppercase leading-none">ETKT</p>
                              <p className="font-mono text-[10px] lg:text-[11px] font-black text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded leading-none mt-1">
                                {p.eTicketNo}
                              </p>
                           </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>

             {/* Financial Section with Toggle */}
             <div className={`flex flex-col ${isFinancialVisible ? 'flex-1' : 'shrink-0'} border-b border-slate-100 transition-all duration-300 min-h-0 ${!isFinancialVisible ? 'no-print' : ''}`}>
                <div className="px-4 lg:px-6 py-2 lg:py-3 border-b border-slate-50 bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Calculator size={14} className="text-emerald-500" />
                    <h3 className="text-[11px] lg:text-xs font-black text-slate-800 uppercase tracking-widest">Financials</h3>
                  </div>
                  <button 
                    onClick={() => setIsFinancialVisible(!isFinancialVisible)}
                    className="p-1 text-slate-400 hover:text-emerald-500 transition-colors no-print"
                    title={isFinancialVisible ? "Hide Financial Info" : "Show Financial Info"}
                  >
                    {isFinancialVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                
                {isFinancialVisible && (
                  <div className="flex-1 p-3 lg:p-5 flex flex-col justify-center gap-3 lg:gap-4 min-h-0 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Purchase</p>
                         <p className="text-xs font-black text-slate-700">{ticket.purchasePrice.toLocaleString()} LKR</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Sales</p>
                         <p className="text-xs font-black text-slate-900">{ticket.salesPrice.toLocaleString()} LKR</p>
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-xl border font-black flex justify-between items-center ${
                      ticket.profit >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                    }`}>
                      <div className="flex items-center gap-2">
                         <TrendingUp size={12} />
                         <span className="text-[10px] uppercase tracking-tighter">Net Profit</span>
                      </div>
                      <span className="text-sm">{ticket.profit.toLocaleString()} LKR</span>
                    </div>
                  </div>
                )}
             </div>

             {/* Administrative Section with Toggle */}
             <div className={`flex flex-col ${isAdminVisible ? 'flex-1' : 'shrink-0'} transition-all duration-300 min-h-0 ${!isAdminVisible ? 'no-print' : ''}`}>
                <div className="px-4 lg:px-6 py-2 lg:py-3 border-b border-slate-50 bg-slate-50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-slate-500" />
                    <h3 className="text-[11px] lg:text-xs font-black text-slate-800 uppercase tracking-widest">Admin</h3>
                  </div>
                  <button 
                    onClick={() => setIsAdminVisible(!isAdminVisible)}
                    className="p-1 text-slate-400 hover:text-blue-500 transition-colors no-print"
                    title={isAdminVisible ? "Hide Admin Info" : "Show Admin Info"}
                  >
                    {isAdminVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                
                {isAdminVisible && (
                  <div className="flex-1 p-3 lg:p-5 flex flex-col justify-center gap-3 lg:gap-4 min-h-0 animate-fadeIn">
                    <div className="space-y-2.5 lg:space-y-3">
                        <div className="p-2.5 lg:p-3.5 bg-white rounded-lg lg:rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Agent</p>
                                <p className="text-xs font-black text-slate-700 uppercase truncate leading-none mt-1">{ticket.customerName || 'Direct'}</p>
                              </div>
                          </div>
                        </div>
                        <div className="p-2.5 lg:p-3.5 bg-white rounded-lg lg:rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-orange-50 rounded text-orange-600">
                                <Info size={14} />
                              </div>
                              <div>
                                <p className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">Source</p>
                                <p className="text-xs font-black text-slate-700 uppercase truncate leading-none mt-1">{ticket.supplierName || 'Internal'}</p>
                              </div>
                          </div>
                        </div>
                    </div>
                    
                    <div className="p-3 rounded-lg lg:rounded-xl border border-slate-200 bg-white/50 border-dashed">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                          <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full ${
                              ticket.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                              {ticket.status}
                          </span>
                        </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer for Print */}
        <div className="print-only hidden px-8 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
           <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <h2 className="text-sm font-black text-slate-900 leading-none">JS LANKA TRAVELS</h2>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Air Transportation Solutions</p>
              </div>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">REF: {ticket.id.slice(0, 8)}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
