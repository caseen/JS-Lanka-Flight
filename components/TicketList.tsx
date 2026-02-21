import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Edit, 
  Download, 
  Bell,
  ArrowRight,
  AlertTriangle,
  Eye,
  PlusCircle,
  Ticket as TicketIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Filter,
  Calendar,
  User,
  Users,
  Hash,
  X,
  ListOrdered,
  Plane,
  Clock,
  Zap
} from 'lucide-react';
import { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
  onDelete: (id: string) => void;
  onUpdate: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onView: (ticket: Ticket) => void;
  onAdd: () => void;
}

type SortField = 'issuedDate' | 'passenger' | 'itinerary' | 'pnr' | 'isDummy' | 'customerName' | 'salesPrice';
type SortOrder = 'asc' | 'desc';

const TicketList: React.FC<TicketListProps> = ({ tickets, onDelete, onUpdate, onEdit, onView, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  
  // Advanced Filter State
  const [filterAirline, setFilterAirline] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPNR, setFilterPNR] = useState('');
  const [filterClient, setFilterClient] = useState('All');
  const [filterPassenger, setFilterPassenger] = useState('');

  const [sortField, setSortField] = useState<SortField>('issuedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticketId: string | null }>({
    isOpen: false,
    ticketId: null,
  });

  const airlines = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.airline).filter(Boolean)))];
  }, [tickets]);

  const clients = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.customerName).filter(Boolean)))];
  }, [tickets]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredTickets = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const pnrLower = filterPNR.toLowerCase();
    const passengerFilterLower = filterPassenger.toLowerCase();

    return tickets.filter(t => {
      const passengers = t.passengers || [];
      const segments = t.segments || [];
      const pnr = t.pnr || '';
      const airline = t.airline || '';
      const customerName = t.customerName || '';

      const basicMatches = !searchTerm || (
        passengers.some(p => 
          (p.name || '').toLowerCase().includes(searchLower) || 
          (p.eTicketNo || '').toLowerCase().includes(searchLower)
        ) ||
        pnr.toLowerCase().includes(searchLower) ||
        segments.some(s => 
          (s.origin || '').toLowerCase().includes(searchLower) || 
          (s.destination || '').toLowerCase().includes(searchLower)
        ) ||
        airline.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower)
      );
      
      if (!basicMatches) return false;

      const matchesAirline = filterAirline === 'All' || airline === filterAirline;
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchesPNR = !filterPNR || pnr.toLowerCase().includes(pnrLower);
      const matchesClient = filterClient === 'All' || customerName === filterClient;
      const matchesPassenger = !filterPassenger || passengers.some(p => (p.name || '').toLowerCase().includes(passengerFilterLower));
      
      const ticketDate = t.issuedDate ? new Date(t.issuedDate) : null;
      const matchesDateFrom = !filterDateFrom || (ticketDate && ticketDate >= new Date(filterDateFrom));
      const matchesDateTo = !filterDateTo || (ticketDate && ticketDate <= new Date(filterDateTo));

      return matchesAirline && matchesStatus && matchesPNR && matchesClient && matchesPassenger && matchesDateFrom && matchesDateTo;
    });
  }, [tickets, searchTerm, filterAirline, filterStatus, filterPNR, filterClient, filterPassenger, filterDateFrom, filterDateTo]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let valA: any = a[sortField as keyof Ticket];
      let valB: any = b[sortField as keyof Ticket];

      if (sortField === 'passenger') {
        valA = (a.passengers?.[0]?.name || '').toLowerCase();
        valB = (b.passengers?.[0]?.name || '').toLowerCase();
      } else if (sortField === 'itinerary') {
        valA = (a.segments?.[0]?.origin || '').toLowerCase();
        valB = (b.segments?.[0]?.origin || '').toLowerCase();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortField, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterAirline, filterStatus, filterPNR, filterClient, filterPassenger, filterDateFrom, filterDateTo, pageSize]);

  const totalPages = Math.ceil(sortedTickets.length / pageSize);
  const currentTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedTickets.slice(start, start + pageSize);
  }, [sortedTickets, currentPage, pageSize]);

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
    const headers = ["Issued Date", "Passengers", "PNR", "Airline", "Full Itinerary Details", "Status", "Sales Price", "Client"];
    const rows = sortedTickets.map(t => [
      t.issuedDate || '',
      (t.passengers || []).map(p => `${p.name || ''} (${p.eTicketNo || ''})`).join('; '),
      t.pnr || '',
      t.airline || '',
      (t.segments || []).map(s => 
        `[${s.flightNo || 'N/A'}] ${s.origin} (${s.departureDate} ${s.departureTime}) to ${s.destination} (${s.arrivalDate} ${s.arrivalTime})`
      ).join(' | '),
      t.status || '',
      t.salesPrice || 0,
      t.customerName || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `JS_LANKA_TICKETS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="flex flex-col opacity-20"><ChevronUp size={10}/><ChevronDown size={10}/></div>;
    return sortOrder === 'asc' ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn pb-12 relative">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-sm overflow-hidden animate-slideUp">
            <div className="p-6 lg:p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight uppercase">Confirm Deletion</h3>
                <p className="text-xs lg:text-sm text-slate-500 mt-2">Are you sure you want to delete this ticket?</p>
              </div>
              <div className="flex flex-col gap-2 pt-2 lg:pt-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95 text-xs tracking-widest uppercase"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, ticketId: null })}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase tracking-tight">Ticket Inventory</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage and Track All Issued Flights</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-tight"
          >
            <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button 
            onClick={onAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-100 font-bold text-[10px] uppercase tracking-tight"
          >
            <PlusCircle size={16} /> <span className="hidden sm:inline">Add New</span><span className="sm:hidden">New Ticket</span>
          </button>
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white p-3 lg:p-4 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Quick Search PNR, Passenger..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-medium bg-slate-50/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <button 
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-bold text-[10px] uppercase transition-all ${
                  isAdvancedSearch ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
             >
                <Filter size={14} /> {isAdvancedSearch ? 'Hide' : 'Filters'}
             </button>
          </div>
        </div>

        {/* Collapsible Advanced Search */}
        {isAdvancedSearch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-slideDown">
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Date Range</label>
                <div className="flex items-center gap-2">
                   <input type="date" className="flex-1 border rounded-lg p-1.5 text-[10px] font-bold" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                   <span className="text-slate-300 text-[8px] font-black">TO</span>
                   <input type="date" className="flex-1 border rounded-lg p-1.5 text-[10px] font-bold" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Passenger Name</label>
                <input type="text" className="w-full border rounded-lg p-1.5 text-[10px] font-bold" placeholder="Filter by Name" value={filterPassenger} onChange={e => setFilterPassenger(e.target.value)} />
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">PNR Locator</label>
                <input type="text" className="w-full border rounded-lg p-1.5 text-[10px] font-bold uppercase" placeholder="Search PNR" value={filterPNR} onChange={e => setFilterPNR(e.target.value)} />
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Agent / Client</label>
                <select className="w-full border rounded-lg p-1.5 text-[10px] font-bold uppercase" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
                   {clients.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Airline</label>
                <select className="w-full border rounded-lg p-1.5 text-[10px] font-bold uppercase" value={filterAirline} onChange={e => setFilterAirline(e.target.value)}>
                   {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select className="w-full border rounded-lg p-1.5 text-[10px] font-bold uppercase" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                   <option value="All">All Status</option>
                   <option value="Confirmed">Confirmed</option>
                   <option value="Cancelled">Cancelled</option>
                   <option value="Changed">Changed</option>
                </select>
             </div>
             <div className="col-span-full flex justify-end">
                <button 
                  onClick={() => {
                    setFilterAirline('All'); setFilterStatus('All'); setFilterDateFrom(''); setFilterDateTo('');
                    setFilterPNR(''); setFilterClient('All'); setFilterPassenger(''); setSearchTerm('');
                  }}
                  className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <X size={10} /> Reset All
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Desktop List View (Table) */}
      <div className="hidden lg:block bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors w-[130px]"
                  onClick={() => toggleSort('issuedDate')}
                >
                  <div className="flex items-center gap-2">
                    Issued Date <SortIndicator field="issuedDate" />
                  </div>
                </th>
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors min-w-[280px]"
                  onClick={() => toggleSort('passenger')}
                >
                  <div className="flex items-center gap-2">
                    Passenger / Airline <SortIndicator field="passenger" />
                  </div>
                </th>
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort('itinerary')}
                >
                  <div className="flex items-center gap-2">
                    Itinerary <SortIndicator field="itinerary" />
                  </div>
                </th>
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors w-[100px]"
                  onClick={() => toggleSort('pnr')}
                >
                  <div className="flex items-center gap-2">
                    PNR <SortIndicator field="pnr" />
                  </div>
                </th>
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors w-[80px]"
                  onClick={() => toggleSort('isDummy')}
                >
                  <div className="flex items-center gap-2">
                    Dummy <SortIndicator field="isDummy" />
                  </div>
                </th>
                <th 
                  className="px-6 py-5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                  onClick={() => toggleSort('customerName')}
                >
                  <div className="flex items-center gap-2">
                    Client <SortIndicator field="customerName" />
                  </div>
                </th>
                <th className="px-6 py-5 text-right w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentTickets.map(ticket => {
                const passengers = ticket.passengers || [];
                const segments = ticket.segments || [];
                const pCount = passengers.length;
                const firstSeg = segments[0];
                
                const path = [];
                if (segments.length > 0) {
                  path.push(segments[0].origin);
                  segments.forEach(s => {
                    if (path[path.length - 1] !== s.destination) {
                      path.push(s.destination);
                    }
                  });
                }

                return (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                    onClick={() => onView(ticket)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-xs font-black text-slate-700">{ticket.issuedDate || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-black text-slate-800 uppercase truncate max-w-[240px]">
                               {passengers[0]?.name || 'Unknown'}
                            </span>
                            {pCount > 1 && (
                              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 inline-flex items-center gap-0.5 border border-blue-100">
                                <Users size={10} /> x{pCount}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-0.5">{ticket.airline || 'Unknown'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center flex-wrap gap-1 font-mono text-[11px] font-black text-slate-600 uppercase">
                          {path.length > 0 ? path.map((city, idx) => (
                            <React.Fragment key={idx}>
                              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{city}</span>
                              {idx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                            </React.Fragment>
                          )) : 'N/A'}
                       </div>
                       {firstSeg && (
                         <div className="mt-1.5 flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                            <div className="flex items-center gap-1">
                               <Calendar size={10} className="text-blue-400" />
                               {firstSeg.departureDate}
                            </div>
                            <div className="flex items-center gap-1">
                               <Clock size={10} className="text-blue-400" />
                               {firstSeg.departureTime}
                            </div>
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Hash size={12} className="text-blue-400" />
                          <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">
                             {ticket.pnr || 'N/A'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {ticket.isDummy ? (
                         <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm shadow-orange-100">
                           YES
                         </span>
                       ) : (
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">NO</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <span className="text-xs font-black text-slate-700 uppercase truncate max-w-[150px]">
                             {ticket.customerName || 'Walk-in'}
                          </span>
                       </div>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                          ticket.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                          ticket.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                       }`}>
                          {ticket.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleReminderToggle(ticket.id)} className={`p-1.5 rounded-lg transition-all ${ticket.reminderSent ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'}`} title="Send Reminder"><Bell size={16} /></button>
                          <button onClick={() => onView(ticket)} className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="View"><Eye size={16} /></button>
                          <button onClick={() => onEdit(ticket)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => initiateDelete(ticket.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {currentTickets.map(ticket => {
          const passengers = ticket.passengers || [];
          const segments = ticket.segments || [];
          const firstSeg = segments[0];
          
          // Simplified unique path logic for display
          const path = [];
          if (segments.length > 0) {
            path.push(segments[0].origin);
            segments.forEach(s => {
              if (path[path.length - 1] !== s.destination) {
                path.push(s.destination);
              }
            });
          }

          // Combine all flight numbers for multiple segments
          const allFlightNos = segments.map(s => s.flightNo).filter(Boolean).join(' / ');
          
          return (
            <div 
              key={ticket.id} 
              className="bg-white p-4 rounded-2xl border shadow-sm active:scale-[0.98] transition-all relative overflow-hidden"
              onClick={() => onView(ticket)}
            >
              {/* Dummy Indicator - Mobile Specific prominent badge */}
              {ticket.isDummy && (
                <div className="absolute top-0 right-0">
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <Zap size={10} fill="currentColor" /> Dummy
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 pr-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-800 uppercase truncate">
                      {passengers[0]?.name || 'Unknown'}
                    </span>
                    {passengers.length > 1 && (
                      <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase whitespace-nowrap">
                        <Users size={8} className="inline mr-0.5" /> x{passengers.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                    <Plane size={10} className="text-blue-400" />
                    {ticket.airline}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-mono font-black border border-blue-100">
                    {ticket.pnr}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    ticket.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                    ticket.status === 'Cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-black text-slate-600 uppercase mb-2">
                    {path.map((city, idx) => (
                      <React.Fragment key={idx}>
                        <span className="bg-white px-1 rounded shadow-xs border border-slate-100">{city}</span>
                        {idx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-700">{firstSeg?.departureDate || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-700">{firstSeg?.departureTime || '--:--'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {allFlightNos || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1 text-slate-400">
                    <ListOrdered size={12} />
                    <span className="text-[9px] font-bold">Issued: {ticket.issuedDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <User size={12} />
                    <span className="text-[9px] font-bold truncate max-w-[80px]">{ticket.customerName || 'Walk-in'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(ticket)} className="p-2 text-slate-400 hover:text-blue-500 transition-all"><Edit size={16} /></button>
                  <button onClick={() => initiateDelete(ticket.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedTickets.length === 0 && (
        <div className="py-24 text-center bg-white rounded-2xl border border-dashed">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-300" />
           </div>
           <h3 className="text-sm font-black text-slate-800 uppercase">No Records Found</h3>
           <p className="text-slate-400 text-[10px] mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Show</label>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg py-1 px-2 outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
           </div>
           <div className="text-slate-400 text-[9px] font-black uppercase tracking-widest hidden sm:block">
              <span className="text-slate-700">{sortedTickets.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}</span> - <span className="text-slate-700">{Math.min(currentPage * pageSize, sortedTickets.length)}</span> of <span className="text-blue-600">{sortedTickets.length}</span>
           </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all border ${currentPage === 1 ? 'text-slate-200 border-slate-50' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all border ${currentPage === page ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'text-slate-500 border-slate-50 hover:bg-slate-50'}`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="px-1 text-slate-300">...</span>}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all border ${currentPage === totalPages ? 'text-slate-200 border-slate-50' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;