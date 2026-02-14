
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Ticket, Customer, Supplier } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import Management from './components/Management';
import BookingDetails from './components/BookingDetails';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        loadData();
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, customersRes, suppliersRes] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name')
      ]);

      if (ticketsRes.data) {
        setTickets(ticketsRes.data.map(t => ({
          id: t.id,
          passengers: t.passengers,
          segments: t.segments,
          pnr: t.pnr,
          issuedDate: t.issued_date,
          airline: t.airline,
          customerName: t.customer_name,
          supplierName: t.supplier_name,
          salesPrice: Number(t.sales_price),
          purchasePrice: Number(t.purchase_price),
          profit: Number(t.profit),
          isDummy: t.is_dummy,
          status: t.status,
          reminderSent: t.reminder_sent,
          createdAt: t.created_at,
          ticketFilePath: t.ticket_file_path
        })));
      }

      if (customersRes.data) setCustomers(customersRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setTickets([]);
    setCustomers([]);
    setSuppliers([]);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleSaveTicket = async (ticket: Ticket) => {
    const dbData = {
      passengers: ticket.passengers,
      segments: ticket.segments,
      pnr: ticket.pnr,
      issued_date: ticket.issuedDate,
      airline: ticket.airline,
      customer_name: ticket.customerName,
      supplier_name: ticket.supplierName,
      sales_price: ticket.salesPrice,
      purchase_price: ticket.purchasePrice,
      profit: ticket.profit,
      is_dummy: ticket.isDummy,
      status: ticket.status,
      reminder_sent: ticket.reminderSent,
      ticket_file_path: ticket.ticketFilePath
    };

    if (editingTicket) {
      await supabase.from('tickets').update(dbData).eq('id', ticket.id);
    } else {
      await supabase.from('tickets').insert([dbData]);
    }
    
    await loadData();
    setEditingTicket(null);
    setCurrentView(AppView.TICKETS);
  };

  const deleteTicket = async (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket?.ticketFilePath) {
      await supabase.storage.from('app-files').remove([ticket.ticketFilePath]);
    }
    await supabase.from('tickets').delete().eq('id', id);
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const updateTicketFromList = async (updatedTicket: Ticket) => {
    await supabase.from('tickets').update({
      reminder_sent: updatedTicket.reminderSent,
      status: updatedTicket.status
    }).eq('id', updatedTicket.id);
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  // Improved Navigation Handlers
  const handleViewTicket = (ticket: Ticket) => {
    setViewingTicket(ticket);
    setCurrentView(AppView.VIEW_TICKET);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setCurrentView(AppView.NEW_TICKET);
  };

  const handleSetView = (view: AppView) => {
    if (view === AppView.NEW_TICKET) {
      setEditingTicket(null); // Clear editing state if clicking "Add Ticket" fresh
    }
    setCurrentView(view);
  };

  const addCustomer = async (customer: Customer) => {
    const { data } = await supabase.from('customers').insert([{ name: customer.name, phone: customer.phone }]).select();
    if (data) {
      setCustomers(prev => [...prev, data[0]]);
      return data[0];
    }
  };

  const updateCustomer = async (updated: Customer) => {
    await supabase.from('customers').update({ name: updated.name, phone: updated.phone }).eq('id', updated.id);
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    setCustomers(prev => prev.filter(c => c.id !== id));
  };
  
  const addSupplier = async (supplier: Supplier) => {
    const { data } = await supabase.from('suppliers').insert([{ name: supplier.name, contact: supplier.contact }]).select();
    if (data) {
      setSuppliers(prev => [...prev, data[0]]);
      return data[0];
    }
  };

  const updateSupplier = async (updated: Supplier) => {
    await supabase.from('suppliers').update({ name: updated.name, contact: updated.contact }).eq('id', updated.id);
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const stats = useMemo(() => {
    const totalSales = tickets.reduce((sum, t) => sum + (Number(t.salesPrice) || 0), 0);
    const totalPurchase = tickets.reduce((sum, t) => sum + (Number(t.purchasePrice) || 0), 0);
    const totalProfit = tickets.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    const dummyCount = tickets.filter(t => t.isDummy).length;
    
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    const upcomingFlights = tickets.filter(t => {
      return t.segments.some(seg => {
        const flightDate = new Date(seg.departureDate);
        return flightDate >= now && flightDate <= fortyEightHoursFromNow;
      });
    }).length;

    return {
      totalTickets: tickets.length,
      totalSales,
      totalPurchase,
      totalProfit,
      upcomingFlights,
      dummyCount
    };
  }, [tickets]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-medium font-mono text-sm uppercase tracking-widest">Securing Session...</p>
      </div>
    );
  }

  if (!sessionUser) {
    return authView === 'signin' 
      ? <SignIn onSwitch={() => setAuthView('signup')} /> 
      : <SignUp onSwitch={() => setAuthView('signin')} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard stats={stats} tickets={tickets} onViewTicket={handleViewTicket} onSeeAll={() => setCurrentView(AppView.TICKETS)} />;
      case AppView.TICKETS:
        return <TicketList tickets={tickets} onDelete={deleteTicket} onUpdate={updateTicketFromList} onEdit={handleEditTicket} onView={handleViewTicket} />;
      case AppView.NEW_TICKET:
        return (
          <TicketForm 
            onSave={handleSaveTicket} 
            customers={customers} 
            suppliers={suppliers} 
            editTicket={editingTicket || undefined} 
            sessionUser={sessionUser} 
            onAddCustomer={addCustomer}
            onAddSupplier={addSupplier}
          />
        );
      case AppView.VIEW_TICKET:
        return viewingTicket ? <BookingDetails ticket={viewingTicket} onBack={() => setCurrentView(AppView.TICKETS)} onEdit={handleEditTicket} /> : null;
      case AppView.CUSTOMERS:
        return <Management type="Customer" items={customers} onAdd={addCustomer} onUpdate={updateCustomer} onDelete={deleteCustomer} />;
      case AppView.SUPPLIERS:
        return <Management type="Supplier" items={suppliers} onAdd={addSupplier} onUpdate={updateSupplier} onDelete={deleteSupplier} />;
      default:
        return <Dashboard stats={stats} tickets={tickets} onViewTicket={handleViewTicket} onSeeAll={() => setCurrentView(AppView.TICKETS)} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={handleSetView}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      user={sessionUser}
      onSignOut={handleSignOut}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
