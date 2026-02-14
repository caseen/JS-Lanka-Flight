
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  AlertCircle,
  FileSearch,
  ArrowRight,
  Eye,
  Calendar,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DashboardStats, Ticket } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  tickets: Ticket[];
  onViewTicket: (ticket: Ticket) => void;
  onSeeAll: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, tickets, onViewTicket, onSeeAll }) => {
  const chartData = [
    { name: 'Sales', value: stats.totalSales, color: '#3b82f6' },
    { name: 'Purchase', value: stats.totalPurchase, color: '#f97316' },
    { name: 'Profit', value: stats.totalProfit, color: stats.totalProfit >= 0 ? '#10b981' : '#ef4444' },
  ];

  const now = new Date();
  const next24h = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  const next48h = new Date(now.getTime() + (48 * 60 * 60 * 1000));

  const upcomingFlights48h = useMemo(() => {
    return tickets.filter(t => {
      return t.segments.some(seg => {
        const depDate = new Date(`${seg.departureDate}T${seg.departureTime || '00:00'}`);
        return depDate >= now && depDate <= next48h;
      });
    }).sort((a, b) => {
      const aDate = new Date(`${a.segments[0].departureDate}T${a.segments[0].departureTime || '00:00'}`);
      const bDate = new Date(`${b.segments[0].departureDate}T${b.segments[0].departureTime || '00:00'}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [tickets]);

  const upcomingDummies24h = useMemo(() => {
    return tickets.filter(t => {
      if (!t.isDummy) return false;
      return t.segments.some(seg => {
        const depDate = new Date(`${seg.departureDate}T${seg.departureTime || '00:00'}`);
        return depDate >= now && depDate <= next24h;
      });
    }).sort((a, b) => {
      const aDate = new Date(`${a.segments[0].departureDate}T${a.segments[0].departureTime || '00:00'}`);
      const bDate = new Date(`${b.segments[0].departureDate}T${b.segments[0].departureTime || '00:00'}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [tickets]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Tickets" 
          value={stats.totalTickets.toString()} 
          icon={<ShoppingCart className="text-blue-600" />} 
          trend="+5.2%"
          trendType="up"
        />
        <StatCard 
          label="Total Sales (LKR)" 
          value={stats.totalSales.toLocaleString()} 
          icon={<TrendingUp className="text-orange-500" />} 
          trend="+12.5%"
          trendType="up"
        />
        <StatCard 
          label="Total Profit (LKR)" 
          value={stats.totalProfit.toLocaleString()} 
          icon={<Wallet className={stats.totalProfit >= 0 ? "text-emerald-500" : "text-rose-500"} />} 
          trend={stats.totalProfit >= 0 ? "+8.3%" : "-2.1%"}
          trendType={stats.totalProfit >= 0 ? "up" : "down"}
          valueColor={stats.totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
        <StatCard 
          label="Upcoming Flights" 
          value={stats.upcomingFlights.toString()} 
          icon={<Clock className="text-amber-500" />} 
          subLabel="Next 48 Hours"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts and Main Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Financial Overview</h3>
              <span className="text-sm text-slate-500">Current Month</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">Recent Tickets</h3>
              <button 
                onClick={onSeeAll}
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-black">
                  <tr>
                    <th className="px-6 py-4">Passenger / Airline</th>
                    <th className="px-6 py-4">Itinerary</th>
                    <th className="px-6 py-4">Next Departure</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Profit</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.slice(0, 5).map(ticket => {
                    const firstSegment = ticket.segments[0];
                    return (
                      <tr 
                        key={ticket.id} 
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        onClick={() => onViewTicket(ticket)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm">{ticket.passengers[0]?.name || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{ticket.airline}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-slate-700">
                            {firstSegment?.origin}
                            <ArrowRight size={12} className="text-slate-300" />
                            {firstSegment?.destination}
                            {ticket.segments.length > 1 && (
                               <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded">+{ticket.segments.length - 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {firstSegment?.departureDate} <span className="font-black text-slate-800">@{firstSegment?.departureTime}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${
                            ticket.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                            ticket.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-black ${ticket.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {ticket.profit.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="p-1.5 bg-slate-50 group-hover:bg-white border rounded-lg text-slate-400 group-hover:text-blue-600 transition-all"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No tickets found. Add your first ticket to see activity.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Special Lists */}
        <div className="space-y-6">
          {/* Upcoming Flights (48h) */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-800">Departures (Next 48h)</h3>
            </div>
            <div className="space-y-3">
              {upcomingFlights48h.length > 0 ? (
                upcomingFlights48h.slice(0, 5).map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => onViewTicket(ticket)}
                    className="w-full text-left p-4 rounded-xl border border-slate-50 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col truncate pr-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{ticket.passengers[0]?.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Client: {ticket.customerName || 'Walk-in'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase h-fit">{ticket.airline}</span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-tighter">PNR: {ticket.pnr}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-slate-200/50 pt-3 mt-1">
                      {ticket.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600 truncate">
                             <span className="bg-white border border-slate-200 px-1 rounded text-[8px] text-blue-500">{seg.flightNo}</span>
                             {seg.origin} <ArrowRight size={8} className="text-slate-300" /> {seg.destination}
                          </div>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none">Dep</span>
                              <span className="text-[10px] font-black text-slate-800 leading-tight">{seg.departureTime}</span>
                              <span className="text-[8px] text-slate-400/80 font-medium leading-none">{seg.departureDate}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none">Arr</span>
                              <span className="text-[10px] font-black text-slate-800 leading-tight">{seg.arrivalTime}</span>
                              <span className="text-[8px] text-slate-400/80 font-medium leading-none">{seg.arrivalDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic border border-dashed rounded-xl">
                  No departures soon.
                </div>
              )}
            </div>
          </div>

          {/* Dummy Tickets (24h) */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-orange-500" size={20} />
              <h3 className="font-bold text-slate-800">Dummies (Next 24h)</h3>
            </div>
            <div className="space-y-3">
              {upcomingDummies24h.length > 0 ? (
                upcomingDummies24h.slice(0, 5).map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => onViewTicket(ticket)}
                    className="w-full text-left p-4 rounded-xl border border-orange-50 bg-orange-50 hover:bg-orange-100 hover:border-orange-200 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col truncate pr-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{ticket.passengers[0]?.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Client: {ticket.customerName || 'Walk-in'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded uppercase h-fit">PNR: {ticket.pnr}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{ticket.airline}</span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-orange-100/50 pt-3 mt-1">
                      {ticket.segments.map((seg, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600 truncate">
                             <span className="bg-white border border-orange-200 px-1 rounded text-[8px] text-orange-500">{seg.flightNo}</span>
                             {seg.origin} <ArrowRight size={8} className="text-slate-300" /> {seg.destination}
                          </div>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none">Dep</span>
                              <span className="text-[10px] font-black text-slate-800 leading-tight">{seg.departureTime}</span>
                              <span className="text-[8px] text-orange-400 font-medium leading-none">{seg.departureDate}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-none">Arr</span>
                              <span className="text-[10px] font-black text-slate-800 leading-tight">{seg.arrivalTime}</span>
                              <span className="text-[8px] text-orange-400 font-medium leading-none">{seg.arrivalDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs italic border border-dashed rounded-xl">
                  No dummy expiries soon.
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-amber-800 mb-2 font-bold">
              <AlertCircle size={20} />
              System Status
            </div>
            <p className="text-sm text-amber-700 mb-2 leading-relaxed">
              All systems operational. AI extraction active.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Live Server Connection
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
  <div className="bg-white p-6 rounded-2xl border shadow-sm group hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />}
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
      <div className={`text-2xl font-black tracking-tight ${valueColor || 'text-slate-900'}`}>{value}</div>
      {subLabel && <p className="text-[10px] font-bold text-slate-400">{subLabel}</p>}
    </div>
  </div>
);

export default Dashboard;
