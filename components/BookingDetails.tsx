
import React from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Calendar, 
  User, 
  CreditCard, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Edit,
  ArrowRight,
  PlaneTakeoff,
  PlaneLanding,
  Download
} from 'lucide-react';
import { Ticket } from '../types';

interface BookingDetailsProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({ ticket, onBack, onEdit }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-12">
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
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-slate-50 {
            background-color: #f8fafc !important;
            -webkit-print-color-adjust: exact;
          }
          .border {
            border: 1px solid #e2e8f0 !important;
          }
          .rounded-3xl {
            border-radius: 1.5rem !important;
          }
        }
      `}</style>

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={20} /> Back to All Tickets
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            <Download size={18} /> Download PDF
          </button>
          <button 
            onClick={() => onEdit(ticket)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            <Edit size={18} /> Edit Booking
          </button>
        </div>
      </div>

      <div id="printable-booking" className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <Plane className="text-orange-400" size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black">{ticket.airline}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-widest bg-blue-500/20 px-2 py-1 rounded">PNR: {ticket.pnr}</span>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    ticket.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                    ticket.status === 'Cancelled' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issued Date</p>
              <p className="text-xl font-black">{ticket.issuedDate}</p>
              {ticket.isDummy && (
                <span className="bg-orange-500 text-[10px] font-black uppercase px-2 py-1 rounded mt-2 tracking-widest">DUMMY BOOKING</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Itinerary Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-sm font-black text-blue-600 uppercase tracking-widest">
              <Calendar size={18} /> Full Itinerary
            </div>
            <div className="space-y-4">
              {ticket.segments.map((seg, idx) => (
                <div key={idx} className="relative bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 flex items-center gap-4 md:gap-8">
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Departure</p>
                        <h3 className="text-2xl font-black text-slate-800">{seg.origin}</h3>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="text-[10px] font-mono font-bold text-slate-400 mb-1">{seg.flightNo}</div>
                        <div className="w-full flex items-center gap-2">
                           <div className="h-0.5 flex-1 bg-slate-200"></div>
                           <Plane size={18} className="text-blue-500 rotate-90" />
                           <div className="h-0.5 flex-1 bg-slate-200"></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Arrival</p>
                        <h3 className="text-2xl font-black text-slate-800">{seg.destination}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-x-8 gap-y-2">
                       <div>
                         <p className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
                           <PlaneTakeoff size={10}/> DEP DATE & TIME
                         </p>
                         <p className="text-xs font-bold text-slate-700">{seg.departureDate} @ <span className="text-sm font-black text-slate-900">{seg.departureTime}</span></p>
                       </div>
                       <div>
                         <p className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1">
                           <PlaneLanding size={10}/> ARR DATE & TIME
                         </p>
                         <p className="text-xs font-bold text-slate-700">{seg.arrivalDate} @ <span className="text-sm font-black text-slate-900">{seg.arrivalTime}</span></p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Passenger Details */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-sm font-black text-blue-600 uppercase tracking-widest">
              <User size={18} /> Passenger List
            </div>
            <div className="overflow-hidden border border-slate-100 rounded-3xl">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger Name</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Ticket Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ticket.passengers.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                      <td className="px-6 py-4 text-right">
                        {p.eTicketNo ? (
                          <span className="font-mono text-sm font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                            {p.eTicketNo}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Business & Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest">
                  <Briefcase size={18} /> Logistics
                </div>
                <div className="grid grid-cols-1 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer / Agent</p>
                      <p className="text-lg font-black text-slate-800">{ticket.customerName || 'Walk-in'}</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier / Airline Direct</p>
                      <p className="text-lg font-black text-slate-800">{ticket.supplierName || 'Not Assigned'}</p>
                   </div>
                </div>
             </section>

             <section className="space-y-6 no-print">
                <div className="flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest">
                  <CreditCard size={18} /> Financial Overview (Hidden on Export)
                </div>
                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <CreditCard size={100} />
                   </div>
                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                         <span className="text-xs font-bold text-blue-100 uppercase">Purchase Price</span>
                         <span className="font-bold">LKR {ticket.purchasePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/20 pb-3">
                         <span className="text-xs font-bold text-blue-100 uppercase">Sales Price</span>
                         <span className="font-bold">LKR {ticket.salesPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <span className="text-xs font-black text-white uppercase tracking-widest">NET PROFIT</span>
                         <div className="text-right">
                            <p className={`text-2xl font-black ${ticket.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                               LKR {ticket.profit.toLocaleString()}
                            </p>
                            <span className="text-[10px] font-bold text-blue-100 opacity-70">Automated Calculation</span>
                         </div>
                      </div>
                   </div>
                </div>
             </section>
          </div>
          
          <div className="print-only hidden mt-20 border-t pt-8 text-center text-slate-400">
             <p className="text-sm font-bold">Thank you for choosing JS Lanka Travels</p>
             <p className="text-[10px] uppercase tracking-widest mt-1">This is a system generated document</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
