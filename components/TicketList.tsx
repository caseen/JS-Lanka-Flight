
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  Bell,
  ArrowRight,
  AlertTriangle,
  Eye,
  Ticket as TicketIcon
} from 'lucide-react';
import { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  onDelete: (id: string) => void;
  onUpdate: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onView: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onDelete, onUpdate, onEdit, onView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAirline, setFilterAirline] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticketId: string | null }>({
    isOpen: false,
    ticketId: null,
  });

  const airlines = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.airline)))];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.passengers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.eTicketNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.segments.some(s => s.origin.toLowerCase().includes(searchTerm.toLowerCase()) || s.destination.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAirline = filterAirline === 'All' || t.airline === filterAirline;
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;

      return matchesSearch && matchesAirline && matchesStatus;
    });
  }, [tickets, searchTerm, filterAirline, filterStatus]);

  const handleReminderToggle = (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      onUpdate({ ...ticket, reminderSent: !ticket.reminderSent });
    }
  };

  const initiateDelete = (id: string) => {
    setDeleteModal({ isOpen: true, ticketId: id });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.ticketId) {
      onDelete(deleteModal.ticketId);
      setDeleteModal({ isOpen: false, ticketId: null });
    }
  };

  const exportToCSV = () => {
    const headers = ["Ticket ID", "Passengers", "PNR", "Airline", "Itinerary", "Status", "Sales Price"];
    const rows = filteredTickets.map(t => [
      t.id,
      t.passengers.map(p => `${p.name} (${p.eTicketNo})`).join('; '),
      t.pnr,
      t.airline,
      t.segments.map(s => `${s.origin}-${s.destination}`).join(', '),
      t.status,
      t.salesPrice
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jslanka_tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn pb-12 relative">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-6 lg:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-black text-slate-800">Confirm Deletion</h3>
                <p className="text-xs lg:text-sm text-slate-500 mt-2">Are you sure you want to delete this ticket? This action cannot be undone.</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 lg:pt-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, ticketId: null })}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 lg:p-4 rounded-2xl border shadow-sm flex flex-col gap-3 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search Passenger, PNR..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full">
          <select 
            className="flex-1 px-3 py-2 border rounded-xl outline-none bg-white text-xs font-black uppercase tracking-tight"
            value={filterAirline}
            onChange={e => setFilterAirline(e.target.value)}
          >
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            className="flex-1 px-3 py-2 border rounded-xl outline-none bg-white text-xs font-black uppercase tracking-tight"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Changed">Changed</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Export CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filteredTickets.map(ticket => {
          const isDummy = ticket.isDummy;
          const themeBg = isDummy ? 'bg-[#fff5e9]' : 'bg-[#f0f7ff]';
          const themeBorder = isDummy ? 'border-[#ffe0bd]' : 'border-[#dbeafe]';
          const pnrColor = isDummy ? 'text-[#e67e22]' : 'text-[#2563eb]';
          const flightBadgeBorder = isDummy ? 'border-[#fce3c7]' : 'border-[#e0f2fe]';
          const flightBadgeText = isDummy ? 'text-[#e67e22]' : 'text-[#2563eb]';
          
          return (
            <div key={ticket.id} className={`${themeBg} ${themeBorder} rounded-[2rem] lg:rounded-[2.5rem] border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-lg group`}>
              <div className="p-5 lg:p-8 pb-4">
                {/* Header Row */}
                <div className="flex justify-between items-start gap-2 mb-4 lg:mb-6">
                  <div className="space-y-3 min-w-0 flex-1">
                    {ticket.passengers.map((p, pIdx) => (
                      <div key={pIdx} className="truncate">
                        <h4 className="font-black text-slate-800 text-sm lg:text-base uppercase tracking-tight leading-none truncate">
                          {p.name}
                        </h4>
                        {p.eTicketNo && (
                          <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                            <TicketIcon size={10} className="shrink-0" />
                            <span className="text-[9px] lg:text-[10px] font-bold font-mono uppercase tracking-tighter truncate">
                              {p.eTicketNo}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="pt-2 border-t border-black/5 mt-2">
                       <p className="text-slate-400 text-[10px] font-bold truncate">
                        Client: <span className="text-slate-600 font-black uppercase">{ticket.customerName || 'Walk-in'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-black text-xs lg:text-sm uppercase tracking-tighter ${pnrColor}`}>
                      PNR: {ticket.pnr}
                    </p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {ticket.airline}
                    </p>
                  </div>
                </div>

                {/* Segments Section */}
                <div className="space-y-4 lg:space-y-6 my-4 lg:my-6">
                  {ticket.segments.map((seg, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/5 pb-3 sm:border-0 sm:pb-0 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 border rounded-md font-mono text-[8px] lg:text-[9px] font-black uppercase tracking-tight bg-white shrink-0 ${flightBadgeBorder} ${flightBadgeText}`}>
                          {seg.flightNo}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono font-black text-slate-700 text-xs lg:text-sm">
                          <span>{seg.origin}</span>
                          <ArrowRight size={12} className="text-slate-300" />
                          <span>{seg.destination}</span>
                        </div>
                      </div>
                      
                      {/* Unified Times Grid */}
                      <div className="flex gap-4 shrink-0 justify-between sm:justify-end text-right">
                        <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">Dep</p>
                          <p className="font-black text-slate-800 text-xs lg:text-sm leading-none">{seg.departureTime}</p>
                          <p className="text-[8px] lg:text-[9px] font-bold text-slate-400/80 mt-1">{seg.departureDate}</p>
                        </div>
                        <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase leading-none mb-0.5">Arr</p>
                          <p className="font-black text-slate-800 text-xs lg:text-sm leading-none">{seg.arrivalTime}</p>
                          <p className="text-[8px] lg:text-[9px] font-bold text-slate-400/80 mt-1">{seg.arrivalDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 lg:px-8 py-3 lg:py-4 bg-white/50 border-t border-black/5 flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-1.5 max-w-[50%]">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                    ticket.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    ticket.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {ticket.status}
                  </span>
                  {isDummy && (
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0">
                      Dummy
                    </span>
                  )}
                </div>
                <div className="flex gap-1 lg:gap-1.5">
                  <button 
                    onClick={() => handleReminderToggle(ticket.id)}
                    className={`p-1.5 lg:p-2 rounded-xl transition-all ${
                      ticket.reminderSent ? 'bg-orange-500 text-white' : 'hover:bg-orange-100/50 text-slate-400 hover:text-orange-600'
                    }`}
                  >
                    <Bell size={16} className="lg:hidden" />
                    <Bell size={18} className="hidden lg:block" />
                  </button>
                  <button 
                    onClick={() => onView(ticket)}
                    className="p-1.5 lg:p-2 hover:bg-emerald-100/50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                  >
                    <Eye size={16} className="lg:hidden" />
                    <Eye size={18} className="hidden lg:block" />
                  </button>
                  <button 
                    onClick={() => onEdit(ticket)}
                    className="p-1.5 lg:p-2 hover:bg-blue-100/50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                  >
                    <Edit size={16} className="lg:hidden" />
                    <Edit size={18} className="hidden lg:block" />
                  </button>
                  <button 
                    onClick={() => initiateDelete(ticket.id)}
                    className="p-1.5 lg:p-2 hover:bg-rose-100/50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 size={16} className="lg:hidden" />
                    <Trash2 size={18} className="hidden lg:block" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="col-span-full py-12 lg:py-20 text-center">
             <div className="w-16 h-16 lg:w-24 lg:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-300" />
             </div>
             <h3 className="text-xl lg:text-2xl font-black text-slate-800 px-4">No matching tickets</h3>
             <p className="text-slate-500 max-w-sm mx-auto mt-2 text-xs lg:text-sm px-6">Try adjusting your filters or search keywords to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
