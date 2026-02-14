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
import { Ticket } from '../types.ts';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => 
      t.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.passengers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [tickets, searchTerm]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const currentTickets = filteredTickets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 uppercase">Ticket Inventory</h3>
        <button onClick={onAdd} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold">Add Ticket</button>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <input 
            type="text" 
            placeholder="Search PNR or Passenger..." 
            className="w-full p-2.5 border rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase">
            <tr>
              <th className="px-6 py-4">PNR</th>
              <th className="px-6 py-4">Passenger</th>
              <th className="px-6 py-4">Airline</th>
              <th className="px-6 py-4">Issued</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentTickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-blue-600">{ticket.pnr}</td>
                <td className="px-6 py-4 font-bold">{ticket.passengers[0]?.name}</td>
                <td className="px-6 py-4 uppercase text-xs">{ticket.airline}</td>
                <td className="px-6 py-4 text-xs">{ticket.issuedDate}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onView(ticket)} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketList;