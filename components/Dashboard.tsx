import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  ArrowRight,
  Calendar,
  Zap,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Users,
  Eye,
  User,
  Plane
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardStats, Ticket, FlightSegment } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onSeeAll: () => void;
}

type TimeHorizon = 'today' | 'monthly' | 'yearly' | 'custom' | 'all';

interface JourneyEvent {
  ticket: Ticket;
  relevantSegments: { segment: FlightSegment; index: number }[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats: initialStats, tickets, onViewTicket, onSeeAll }) => {
  // Global Time Horizon Filter
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('monthly');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  
  // Specific Month/Year Selections
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Table-specific Advanced Filter State
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [tableFilters, setTableFilters] = useState({
    airline: 'All',
    status: 'All',
    dateFrom: '',
    dateTo: '',
    pnr: '',
    client: 'All',
    passenger: ''
  });

  // Helper to determine Journey Label based on 24h Connection Rule
  const getJourneyLabel = (ticket: Ticket) => {
    const segs = ticket.segments;
    if (!segs || segs.length <= 1) return 'Direct';
    
    let hasTransitConnection = false;
    for (let i = 0; i < segs.length - 1; i++) {
      const arrival = new Date(`${segs[i].arrivalDate} ${segs[i].arrivalTime || '00:00'}`);
      const nextDeparture = new Date(`${segs[i+1].departureDate} ${segs[i+1].departureTime || '00:00'}`);
      
      const diffMs = nextDeparture.getTime() - arrival.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Connection is less than 24 hours -> Transit
      if (diffHours > 0 && diffHours < 24) {
        hasTransitConnection = true;
        break;
      }
    }
    
    if (hasTransitConnection) return 'Transit';
    return 'Stopover';
  };

  // Helper to get the full end-to-end path with stops
  const getFullJourneyPath = (ticket: Ticket) => {
    const path: string[] = [];
    if (ticket.segments && ticket.segments.length > 0) {
      path.push(ticket.segments[0].origin);
      ticket.segments.forEach(seg => {
        if (path[path.length - 1] !== seg.destination) {
          path.push(seg.destination);
        }
      });
    }
    return path;
  };

  // Calculate filtered stats based on global time horizon and sub-selectors
  const filteredStats = useMemo(() => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = tickets.filter(t => {
      const ticketDate = new Date(t.issuedDate);
      
      switch (timeHorizon) {
        case 'today':
          return ticketDate >= startOfToday;
        case 'monthly': {
          const [y, m] = selectedMonth.split('-').map(Number);
          return ticketDate.getFullYear() === y && (ticketDate.getMonth() + 1) === m;
        }
        case 'yearly':
          return ticketDate.getFullYear() === selectedYear;
        case 'custom': {
          const from = customRange.from ? new Date(customRange.from) : null;
          const to = customRange.to ? new Date(customRange.to) : null;
          return (!from || ticketDate >= from) && (!to || ticketDate <= to);
        }
        case 'all':
        default:
          return true;
      }
    });

    const totalSales = filtered.reduce((sum, t) => sum + (Number(t.salesPrice) || 0), 0);
    const totalPurchase = filtered.reduce((sum, t) => sum + (Number(t.purchasePrice) || 0), 0);
    const totalProfit = filtered.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    let upcomingSegmentsCount = 0;
    tickets.forEach(t => {
      t.segments.forEach(seg => {
        const depDate = new Date(`${seg.departureDate} ${seg.departureTime || '00:00'}`);
        if (depDate >= now && depDate <= fortyEightHoursFromNow) {
          upcomingSegmentsCount++;
        }
      });
    });

    return {
      totalTickets: filtered.length,
      totalSales,
      totalPurchase,
      totalProfit,
      upcomingFlights: upcomingSegmentsCount,
      dummyCount: filtered.filter(t => t.isDummy).length,
      filteredTickets: filtered
    };
  }, [tickets, timeHorizon, customRange, selectedMonth, selectedYear, now]);

  const chartData = [
    { name: 'Sales', value: filteredStats.totalSales, color: '#3b82f6' },
    { name: 'Purchase', value: filteredStats.totalPurchase, color: '#f97316' },
    { name: 'Profit', value: filteredStats.totalProfit, color: filteredStats.totalProfit >= 0 ? '#10b981' : '#ef4444' },
  ];

  const airlines = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.airline).filter(Boolean)))];
  }, [tickets]);

  const clients = useMemo(() => {
    return ['All', ...Array.from(new Set(tickets.map(t => t.customerName).filter(Boolean)))];
  }, [tickets]);

  const filteredAuditTickets = useMemo(() => {
    return filteredStats.filteredTickets.filter(t => {
      const matchesAirline = tableFilters.airline === 'All' || t.airline === tableFilters.airline;
      const matchesStatus = tableFilters.status === 'All' || t.status === tableFilters.status;
      const matchesPNR = !tableFilters.pnr || t.pnr.toLowerCase().includes(tableFilters.pnr.toLowerCase());
      const matchesClient = tableFilters.client === 'All' || t.customerName === tableFilters.client;
      const matchesPassenger = !tableFilters.passenger || t.passengers.some(p => p.name.toLowerCase().includes(tableFilters.passenger.toLowerCase()));
      
      const ticketDate = new Date(t.issuedDate);
      const matchesDateFrom = !tableFilters.dateFrom || (ticketDate && ticketDate >= new Date(tableFilters.dateFrom));
      const matchesDateTo = !tableFilters.dateTo || (ticketDate && ticketDate <= new Date(tableFilters.dateTo));

      return matchesAirline && matchesStatus && matchesPNR && matchesClient && matchesPassenger && matchesDateFrom && matchesDateTo;
    });
  }, [filteredStats.filteredTickets, tableFilters]);

  // Grouped Logic for Upcoming Dummies (24 Hours Window)
  const upcomingDummiesGrouped = useMemo(() => {
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const journeys: JourneyEvent[] = [];

    tickets.forEach(t => {
      if (!t.isDummy) return;
      
      const relevantSegments = t.segments
        .map((seg, index) => ({ segment: seg, index }))
        .filter(item => {
          const depDate = new Date(`${item.segment.departureDate} ${item.segment.departureTime || '00:00'}`);
          return depDate >= now && depDate <= twentyFourHoursFromNow;
        });

      if (relevantSegments.length > 0) {
        journeys.push({ 
          ticket: t, 
          relevantSegments: relevantSegments.sort((a, b) => {
            const dateA = new Date(`${a.segment.departureDate} ${a.segment.departureTime || '00:00'}`);
            const dateB = new Date(`${b.segment.departureDate} ${b.segment.departureTime || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
          })
        });
      }
    });

    return journeys.sort((a, b) => {
      const aDate = new Date(`${a.relevantSegments[0].segment.departureDate} ${a.relevantSegments[0].segment.departureTime || '00:00'}`);
      const bDate = new Date(`${b.relevantSegments[0].segment.departureDate} ${b.relevantSegments[0].segment.departureTime || '00:00'}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [tickets, now]);

  // JOURNEY LOGIC: Group multiple legs together for Departures (48h)
  const upcomingJourneys48h = useMemo(() => {
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    const journeys: JourneyEvent[] = [];

    tickets.forEach(t => {
      const relevantSegments = t.segments
        .map((seg, index) => ({ segment: seg, index }))
        .filter(item => {
          const depDate = new Date(`${item.segment.departureDate} ${item.segment.departureTime || '00:00'}`);
          const isUrgentDummy = t.isDummy && depDate <= twentyFourHoursFromNow;
          return depDate >= now && depDate <= fortyEightHoursFromNow && !isUrgentDummy;
        });

      if (relevantSegments.length > 0) {
        journeys.push({ 
          ticket: t, 
          relevantSegments: relevantSegments.sort((a, b) => {
            const dateA = new Date(`${a.segment.departureDate} ${a.segment.departureTime || '00:00'}`);
            const dateB = new Date(`${b.segment.departureDate} ${b.segment.departureTime || '00:00'}`);
            return dateA.getTime() - dateB.getTime();
          })
        });
      }
    });

    return journeys.sort((a, b) => {
      const aDate = new Date(`${a.relevantSegments[0].segment.departureDate} ${a.relevantSegments[0].segment.departureTime || '00:00'}`);
      const bDate = new Date(`${b.relevantSegments[0].segment.departureDate} ${b.relevantSegments[0].segment.departureTime || '00:00'}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [tickets, now]);

  const resetTableFilters = () => {
    setTableFilters({
      airline: 'All',
      status: 'All',
      dateFrom: '',
      dateTo: '',
      pnr: '',
      client: 'All',
      passenger: ''
    });
  };

  const activeTableFilterCount = Object.values(tableFilters).filter(v => v !== 'All' && v !== '').length;

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn pb-12">
      {/* Global Dashboard Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-2">
          <History size={18} className="text-blue-50" />
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dashboard Period</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-hidden w-full sm:w-auto">
            {(['today', 'monthly', 'yearly', 'all', 'custom'] as TimeHorizon[]).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${
                  timeHorizon === horizon 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 animate-fadeIn">
            {timeHorizon === 'monthly' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <Calendar size={12} className="text-blue-500" />
                <input 
                  type="month" 
                  className="bg-transparent text-[10px] font-black text-slate-600 outline-none uppercase"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                />
              </div>
            )}

            {timeHorizon === 'yearly' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <Calendar size={12} className="text-blue-500" />
                <select 
                  className="bg-transparent text-[10px] font-black text-slate-600 outline-none cursor-pointer"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {timeHorizon === 'custom' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                  value={customRange.from}
                  onChange={e => setCustomRange({...customRange, from: e.target.value})}
                />
                <span className="text-[9px] font-black text-slate-300">TO</span>
                <input 
                  type="date" 
                  className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                  value={customRange.to}
                  onChange={e => setCustomRange({...customRange, to: e.target.value})}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid - UPDATED TO 2 COLUMNS ON MOBILE */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard 
          label={`Tickets (${timeHorizon})`} 
          value={filteredStats.totalTickets.toString()} 
          icon={<ShoppingCart className="text-blue-600" />} 
          trend="+5.2%"
          trendType="up"
        />
        <StatCard 
          label="Sales (LKR)" 
          value={filteredStats.totalSales.toLocaleString()} 
          icon={<TrendingUp className="text-orange-500" />} 
          trend="+12.5%"
          trendType="up"
        />
        <StatCard 
          label="Profit (LKR)" 
          value={filteredStats.totalProfit.toLocaleString()} 
          icon={<Wallet className={filteredStats.totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"} />} 
          trend={filteredStats.totalProfit >= 0 ? "+8.3%" : "-2.1%"}
          trendType={filteredStats.totalProfit >= 0 ? "up" : "down"}
          valueColor={filteredStats.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
        <StatCard 
          label="Upcoming Activity" 
          value={filteredStats.upcomingFlights.toString()} 
          icon={<Clock className="text-amber-500" />} 
          subLabel="Flights in 48h"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2 lg:order-1">
          {/* Chart Section */}
          <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-sm lg:text-base tracking-tight uppercase">Financial Performance</h3>
              <span className="text-[8px] lg:text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">
                Horizon: {timeHorizon === 'monthly' ? selectedMonth : timeHorizon === 'yearly' ? selectedYear : timeHorizon}
              </span>
            </div>
            <div className="h-[200px] lg:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 border-b flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-800 text-sm lg:text-base tracking-tight uppercase">Inventory Audit</h3>
                  {activeTableFilterCount > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                      {activeTableFilterCount} Filters
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                    className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${
                      isAdvancedFilterOpen || activeTableFilterCount > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Filter size={12} />
                    {isAdvancedFilterOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  <button 
                    onClick={onSeeAll}
                    className="text-blue-600 text-[9px] font-black uppercase tracking-widest hover:underline px-2"
                  >
                    All
                  </button>
                </div>
              </div>

              {isAdvancedFilterOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-slate-50 animate-slideDown">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">Passenger</label>
                    <input 
                      type="text" 
                      placeholder="Name..."
                      className="w-full border rounded-lg p-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50" 
                      value={tableFilters.passenger}
                      onChange={e => setTableFilters({...tableFilters, passenger: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">PNR</label>
                    <input 
                      type="text" 
                      placeholder="Locator..."
                      className="w-full border rounded-lg p-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 uppercase" 
                      value={tableFilters.pnr}
                      onChange={e => setTableFilters({...tableFilters, pnr: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">Airline</label>
                    <select 
                      className="w-full border rounded-lg p-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                      value={tableFilters.airline}
                      onChange={e => setTableFilters({...tableFilters, airline: e.target.value})}
                    >
                      {airlines.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">Client</label>
                    <select 
                      className="w-full border rounded-lg p-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50 uppercase"
                      value={tableFilters.client}
                      onChange={e => setTableFilters({...tableFilters, client: e.target.value})}
                    >
                      {clients.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-0.5">
                    <button 
                      onClick={resetTableFilters}
                      className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-dashed border-rose-100"
                    >
                      <X size={10} /> Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left min-w-[700px] border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-[9px] uppercase tracking-wider font-black">
                  <tr>
                    <th className="px-6 py-4">Issued</th>
                    <th className="px-6 py-4">Passenger / Airline</th>
                    <th className="px-6 py-4">Itinerary</th>
                    <th className="px-6 py-4">PNR</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAuditTickets.slice(0, 8).map(ticket => {
                    const path = getFullJourneyPath(ticket);
                    
                    return (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        onClick={() => onViewTicket(ticket)}
                      >
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black text-slate-700">{ticket.issuedDate || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <div className="font-black text-slate-800 text-[12px] uppercase tracking-tight truncate max-w-[150px]">
                                {ticket.passengers[0]?.name || 'N/A'}
                              </div>
                              {ticket.passengers.length > 1 && (
                                <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 shrink-0">
                                  <Users size={8} /> x{ticket.passengers.length}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{ticket.airline}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-1 text-[9px] font-medium text-slate-600 uppercase">
                            {path.map((city, idx) => (
                              <React.Fragment key={idx}>
                                <span>{city}</span>
                                {idx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{ticket.segments[0]?.departureDate}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">{ticket.segments[0]?.departureTime}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100">
                            {ticket.pnr}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <User size={10} className="text-slate-400" />
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[120px]">
                              {ticket.customerName || 'Walk-in'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button className="p-1.5 bg-slate-50 group-hover:bg-white border rounded-lg text-slate-400 group-hover:text-blue-600 transition-all">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View for Inventory Audit */}
            <div className="lg:hidden divide-y divide-slate-50">
              {filteredAuditTickets.slice(0, 8).map(ticket => {
                const path = getFullJourneyPath(ticket);
                return (
                  <div
                    key={ticket.id}
                    className="p-4 hover:bg-blue-50/50 cursor-pointer active:bg-slate-50 transition-colors"
                    onClick={() => onViewTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="font-black text-slate-800 text-xs uppercase tracking-tight truncate">
                            {ticket.passengers[0]?.name || 'N/A'}
                          </div>
                          {ticket.passengers.length > 1 && (
                            <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1 py-0.5 rounded border border-blue-100 flex items-center gap-0.5 shrink-0">
                              <Users size={8} /> x{ticket.passengers.length}
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-blue-600 font-black uppercase tracking-tighter">{ticket.airline}</div>
                      </div>
                      <span className="font-mono text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase border border-blue-100 shrink-0">
                        {ticket.pnr}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[9px] font-medium text-slate-600 uppercase mb-3">
                      <Plane size={10} className="text-slate-400 shrink-0" />
                      {path.map((city, idx) => (
                        <React.Fragment key={idx}>
                          <span>{city}</span>
                          {idx < path.length - 1 && <ArrowRight size={8} className="text-slate-300" />}
                        </React.Fragment>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={10} className="text-slate-400" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap">
                          Iss: <span className="text-slate-700">{ticket.issuedDate || 'N/A'}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Plane size={10} className="text-blue-400" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase whitespace-nowrap">
                          Trv: <span className="text-blue-600 font-black">{ticket.segments[0]?.departureDate || 'N/A'}</span>
                          {ticket.segments[0]?.departureTime && (
                            <span className="text-slate-400 ml-1">@ {ticket.segments[0].departureTime}</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        <User size={10} className="text-slate-400" />
                        <span className="text-[8px] font-black text-slate-700 uppercase truncate max-w-[80px]">
                          {ticket.customerName || 'Walk-in'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAuditTickets.length === 0 && (
              <div className="p-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
                 No records found for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
          {/* Departures (48h) */}
          <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={18} />
              <h3 className="font-black text-slate-800 text-xs tracking-tight uppercase">Departures (48h)</h3>
            </div>
            <div className="space-y-3">
              {upcomingJourneys48h.length > 0 ? (
                upcomingJourneys48h.slice(0, 8).map((journey, idx) => {
                  const label = getJourneyLabel(journey.ticket);
                  
                  // Always show the full path from the entire ticket for consistent end-to-end view
                  const path = getFullJourneyPath(journey.ticket);
                  const firstRelevant = journey.relevantSegments[0];

                  return (
                    <button 
                      key={`${journey.ticket.id}-journey-${idx}`}
                      onClick={() => onViewTicket(journey.ticket)}
                      className={`w-full text-left p-3 rounded-xl border transition-all group relative overflow-hidden ${
                        journey.ticket.isDummy 
                          ? 'border-orange-50 bg-[#fffbf6] hover:bg-[#fff5e8] hover:border-orange-100' 
                          : 'border-blue-50 bg-blue-50/30 hover:bg-blue-100/50 hover:border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[11px] font-black text-slate-800 uppercase truncate">
                                {journey.ticket.passengers[0]?.name}
                              </p>
                              {journey.ticket.passengers.length > 1 && (
                                <span className="text-[9px] text-blue-600 font-black inline-flex items-center gap-0.5 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                                  <Users size={9} /> x{journey.ticket.passengers.length}
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">Client: {journey.ticket.customerName || 'Walk-in'}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${
                              journey.ticket.isDummy ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                            }`}>{journey.ticket.pnr}</span>
                            <span className="bg-[#D1D5DB] text-white text-[6px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                              {label}
                            </span>
                          </div>
                      </div>

                      {/* Path display with reduced font size and medium weight */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center flex-wrap gap-1 text-[9px] font-medium text-slate-600 uppercase">
                          {path.map((city, cIdx) => (
                            <React.Fragment key={cIdx}>
                              <span>{city}</span>
                              {cIdx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                            </React.Fragment>
                          ))}
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">{journey.ticket.airline}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                         <div className="flex items-center gap-1.5">
                            <Calendar size={10} className={journey.ticket.isDummy ? 'text-orange-400' : 'text-blue-400'} />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{firstRelevant.segment.departureDate}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Clock size={10} className={journey.ticket.isDummy ? 'text-orange-400' : 'text-blue-400'} />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{firstRelevant.segment.departureTime}</span>
                         </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-300 text-[8px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
                  Clear Skies
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Dummies (24h) */}
          <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-orange-500" size={18} />
              <h3 className="font-black text-slate-800 text-xs tracking-tight uppercase">Upcoming Dummies</h3>
            </div>
            <div className="space-y-3">
              {upcomingDummiesGrouped.length > 0 ? (
                upcomingDummiesGrouped.slice(0, 5).map((journey, idx) => {
                  const label = getJourneyLabel(journey.ticket);
                  
                  // For Dummies, also show the full ticket path for completeness
                  const path = getFullJourneyPath(journey.ticket);
                  const firstRelevant = journey.relevantSegments[0];

                  return (
                    <button 
                      key={`${journey.ticket.id}-dummy-${idx}`}
                      onClick={() => onViewTicket(journey.ticket)}
                      className="w-full text-left p-3 rounded-xl border border-orange-50 bg-[#fffbf6] hover:bg-[#fff5e8] hover:border-orange-100 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[11px] font-black text-slate-800 uppercase truncate">
                                {journey.ticket.passengers[0]?.name}
                              </p>
                              {journey.ticket.passengers.length > 1 && (
                                <span className="text-[9px] text-orange-600 font-black inline-flex items-center gap-0.5 bg-orange-50 px-1 py-0.5 rounded border border-blue-100">
                                  <Users size={9} /> x{journey.ticket.passengers.length}
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">Client: {journey.ticket.customerName || 'Walk-in'}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0">{journey.ticket.pnr}</span>
                            <span className="bg-[#D1D5DB] text-white text-[6px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                              {label}
                            </span>
                          </div>
                      </div>

                      {/* Path display with reduced font size and medium weight */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                         <div className="flex items-center flex-wrap gap-1 text-[9px] font-medium text-slate-600 uppercase">
                            {path.map((city, cIdx) => (
                              <React.Fragment key={cIdx}>
                                <span>{city}</span>
                                {cIdx < path.length - 1 && <ArrowRight size={10} className="text-slate-300" />}
                              </React.Fragment>
                            ))}
                         </div>
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">{journey.ticket.airline}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-orange-100/50">
                         <div className="flex items-center gap-1.5">
                            <Calendar size={10} className="text-orange-400" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{firstRelevant.segment.departureDate}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <Clock size={10} className="text-orange-400" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">{firstRelevant.segment.departureTime}</span>
                         </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-300 text-[8px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
                  No Dummy Tickets
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  trend?: string; 
  trendType?: 'up' | 'down'; 
  subLabel?: string; 
  valueColor?: string;
}> = ({ label, value, icon, trend, trendType, subLabel, valueColor }) => (
  <div className="bg-white p-3.5 lg:p-6 rounded-2xl border shadow-sm group hover:shadow-md transition-all active:scale-[0.98]">
    <div className="flex items-center justify-between mb-3 lg:mb-4">
      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors shrink-0">
        {React.cloneElement(icon as React.ReactElement, { size: 16 })}
      </div>
      {trend && (
        <span className={`flex items-center text-[7px] lg:text-[8px] font-black px-1 py-0.5 rounded-full ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={8} /> : <ArrowUpRight size={8} className="rotate-90" />}
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-0.5">
      <h4 className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</h4>
      <div className={`text-sm lg:text-xl font-black tracking-tighter ${valueColor || 'text-slate-900'} truncate`}>{value}</div>
      {subLabel && <p className="text-[6.5px] lg:text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">{subLabel}</p>}
    </div>
  </div>
);

export default Dashboard;