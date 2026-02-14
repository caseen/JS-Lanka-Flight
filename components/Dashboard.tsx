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
import { DashboardStats, Ticket } from '../types.ts';

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

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn pb-12">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg tracking-tight uppercase mb-6">Financial Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      {trend && (
        <span className={`flex items-center text-[10px] font-black px-2 py-1 rounded-full ${
          trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
      <div className={`text-2xl font-black tracking-tighter ${valueColor || 'text-slate-900'}`}>{value}</div>
      {subLabel && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subLabel}</p>}
    </div>
  </div>
);

export default Dashboard;