
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
  Hash,
  X,
  ListOrdered
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

type SortField = 'issuedDate' | 'passenger' | 'departureDate' | 'pnr' | 'isDummy' | 'customerName' | 'salesPrice';
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
  const [filterClient, setFilterClient] = useState('');
  const [filterPassenger, setFilterPassenger] = useState('');

  const [sortField, setSortField] = useState<SortField>('issuedDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticketId: string | null }>({
    isOpen: false,
    ticketId: null,
  });

  const airlines = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.airline)))];
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
    return tickets.filter(t => {
      // Basic Search
      const basicMatches = 
        t.passengers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.eTicketNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.segments.some(s => s.origin.toLowerCase().includes(searchTerm.toLowerCase()) || s.destination.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!basicMatches && searchTerm) return false;

      // Advanced Filters
      const matchesAirline = filterAirline === 'All' || t.airline === filterAirline;
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchesPNR = !filterPNR || t.pnr.toLowerCase().includes(filterPNR.toLowerCase());
      const matchesClient = !filterClient || t.customerName.toLowerCase().includes(filterClient.toLowerCase());
      const matchesPassenger = !filterPassenger || t.passengers.some(p => p.name.toLowerCase().includes(filterPassenger.toLowerCase()));
      
      const ticketDate = new Date(t.issuedDate);
      const matchesDateFrom = !filterDateFrom || ticketDate >= new Date(filterDateFrom);
      const matchesDateTo = !filterDateTo || ticketDate <= new Date(filterDateTo);

      return matchesAirline && matchesStatus && matchesPNR && matchesClient && matchesPassenger && matchesDateFrom && matchesDateTo;
    });
  }, [tickets, searchTerm, filterAirline, filterStatus, filterPNR, filterClient, filterPassenger, filterDateFrom, filterDateTo]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      // Custom field handling for sorting
      if (sortField === 'passenger') {
        valA = a.passengers[0]?.name || '';
        valB = b.passengers[0]?.name || '';
      } else if (sortField === 'departureDate') {
        valA = a.segments[0]?.departureDate || '';
        valB = b.segments[0]?.departureDate || '';
      } else {
        valA = a[sortField as keyof Ticket] || '';
        valB = b[sortField as keyof Ticket] || '';
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
    const headers = ["Issued Date", "Passengers", "PNR", "Airline", "Itinerary", "Status", "Sales Price", "Client"];
    const rows = sortedTickets.map(t => [
      t.issuedDate,
      t.passengers.map(p => `${p.name} (${p.eTicketNo})`).join('; '),
      t.pnr,
      t.airline,
      t.segments.map(s => `${s.origin}-${s.destination}`).join(', '),
      t.status,
      t.salesPrice,
      t.customerName
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
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
           <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ticket Inventory</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage and Track All Issued Flights</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-tight"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={onAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-100 font-bold text-xs uppercase tracking-tight"
          >
            <PlusCircle size={18} /> Add New Ticket
          </button>
        </div>
      </div>

      {/* Search & Advanced Filters Bar */}
      <div className="bg-white p-3 lg:p-4 rounded-2xl border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Quick Search PNR, Passenger..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium bg-slate-50/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase transition-all ${
                  isAdvancedSearch ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
             >
                <Filter size={16} /> {isAdvancedSearch ? 'Hide Filters' : 'Advanced Search'}
             </button>
          </div>
        </div>

        {/* Collapsible Advanced Search */}
        {isAdvancedSearch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-slideDown">
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Date Range</label>
                <div className="flex items-center gap-2">
                   <input type="date" className="flex-1 border rounded-lg p-2 text-xs font-bold" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
                   <span className="text-slate-300 text-[10px] font-black">TO</span>
                   <input type="date" className="flex-1 border rounded-lg p-2 text-xs font-bold" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Passenger Name</label>
                <input type="text" className="w-full border rounded-lg p-2 text-xs font-bold" placeholder="Filter by Name" value={filterPassenger} onChange={e => setFilterPassenger(e.target.value)} />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">PNR Locator</label>
                <input type="text" className="w-full border rounded-lg p-2 text-xs font-bold uppercase" placeholder="Search PNR" value={filterPNR} onChange={e => setFilterPNR(e.target.value)} />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Agent / Client</label>
                <input type="text" className="w-full border rounded-lg p-2 text-xs font-bold" placeholder="Search Client" value={filterClient} onChange={e => setFilterClient(e.target.value)} />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Airline</label>
                <select className="w-full border rounded-lg p-2 text-xs font-bold uppercase" value={filterAirline} onChange={e => setFilterAirline(e.target.value)}>
                   {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                <select className="w-full border rounded-lg p-2 text-xs font-bold uppercase" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
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
                    setFilterPNR(''); setFilterClient(''); setFilterPassenger(''); setSearchTerm('');
                  }}
                  className="text-xs font-black text-rose-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Clear All Filters
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Professional List View (Table) */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
                  onClick={() => toggleSort('departureDate')}
                >
                  <div className="flex items-center gap-2">
                    Itinerary (Full Path) <SortIndicator field="departureDate" />
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
                const pCount = ticket.passengers.length;
                
                // Itinerary path logic
                const path = [];
                if (ticket.segments.length > 0) {
                  path.push(ticket.segments[0].origin);
                  ticket.segments.forEach(s => {
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
                    {/* Issued Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-xs font-black text-slate-700">{ticket.issuedDate}</span>
                      </div>
                    </td>

                    {/* Passenger / Airline */}
                    <td className="px-6 py-4">
                       <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[13px] font-black text-slate-800 uppercase truncate max-w-[240px]">
                               {ticket.passengers[0]?.name}
                               {ticket.passengers[0]?.type && ticket.passengers[0].type !== 'Adult' && (
                                 <span className="text-blue-600 ml-1">({ticket.passengers[0].type})</span>
                               )}
                            </span>
                            {pCount > 1 && (
                              <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0">
                                +{pCount - 1} More
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-0.5">{ticket.airline}</span>
                       </div>
                    </td>

                    {/* Itinerary (Full Path) */}
                    <td className="px-6 py-4">
                       <div className="flex items-center flex-wrap gap-1 font-mono text-[11px] font-black text-slate-600 uppercase">
                          {path.map((city, idx) => (
                            <React.Fragment key={idx}>
                              <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{city}</span>
                              {idx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                            </React.Fragment>
                          ))}
                       </div>
                       <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{ticket.segments[0]?.departureDate}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{ticket.segments[0]?.departureTime}</span>
                       </div>
                    </td>

                    {/* PNR */}
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <Hash size={12} className="text-blue-400" />
                          <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">
                             {ticket.pnr}
                          </span>
                       </div>
                    </td>

                    {/* Dummy */}
                    <td className="px-6 py-4">
                       {ticket.isDummy ? (
                         <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm shadow-orange-100">
                           YES
                         </span>
                       ) : (
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">NO</span>
                       )}
                    </td>

                    {/* Client */}
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

                    {/* Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-end gap-1">
                          <button 
                             onClick={() => handleReminderToggle(ticket.id)}
                             className={`p-1.5 rounded-lg transition-all ${ticket.reminderSent ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'}`}
                             title="Send Reminder"
                          >
                             <Bell size={16} />
                          </button>
                          <button 
                             onClick={() => onView(ticket)}
                             className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                             title="View"
                          >
                             <Eye size={16} />
                          </button>
                          <button 
                             onClick={() => onEdit(ticket)}
                             className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                             title="Edit"
                          >
                             <Edit size={16} />
                          </button>
                          <button 
                             onClick={() => initiateDelete(ticket.id)}
                             className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                             title="Delete"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedTickets.length === 0 && (
          <div className="py-24 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-black text-slate-800 uppercase">No Matching Records Found</h3>
             <p className="text-slate-400 text-xs mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      {/* Pagination & Page Selector Footer */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mt-6 bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
        
        {/* Left: Entries Info & Page Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
           <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ListOrdered size={14} /> Show
              </label>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
           </div>
           <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              Showing <span className="text-slate-700">{((currentPage - 1) * pageSize) + 1}</span> - <span className="text-slate-700">{Math.min(currentPage * pageSize, sortedTickets.length)}</span> of <span className="text-blue-600">{sortedTickets.length}</span> records
           </div>
        </div>

        {/* Right: Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-2.5 rounded-xl transition-all border ${
                currentPage === 1 
                  ? 'text-slate-300 border-slate-50 cursor-not-allowed' 
                  : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-blue-600 active:scale-95 shadow-sm'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Pagination logic: show 1st, last, and current +/- 1
                if (totalPages > 5) {
                   if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                      if (Math.abs(page - currentPage) === 2) return <span key={`dots-${page}`} className="px-1 text-slate-300">...</span>;
                      return null;
                   }
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all border ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100 scale-105 z-10' 
                        : 'text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`p-2.5 rounded-xl transition-all border ${
                currentPage === totalPages 
                  ? 'text-slate-300 border-slate-50 cursor-not-allowed' 
                  : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-blue-600 active:scale-95 shadow-sm'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
