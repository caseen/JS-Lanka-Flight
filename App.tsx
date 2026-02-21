import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { CheckCircle, X } from 'lucide-react';

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
  const [notifications, setNotifications] = useState<{id: string, message: string, time: Date}[]>([]);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const loadData = useCallback(async () => {
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
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user ?? null);
      if (session?.user) {
        await loadData();
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  // Automated Notification Engine - Checks ALL segments
  useEffect(() => {
    if (tickets.length === 0) return;
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const newAlerts: {message: string, id: string}[] = [];

    tickets.forEach(ticket => {
      const totalSegs = ticket.segments.length;
      ticket.segments.forEach((seg, idx) => {
        const depDate = new Date(`${seg.departureDate} ${seg.departureTime || '00:00'}`);
        const legInfo = totalSegs > 1 ? ` (Leg ${idx + 1}/${totalSegs})` : '';
        
        if (ticket.isDummy && depDate >= now && depDate <= twentyFourHoursFromNow) {
          const msg = `⚠️ ${ticket.pnr}${legInfo} - Flight ${seg.origin}→${seg.destination} departs in <24h!`;
          if (!notifications.some(n => n.message === msg)) {
            newAlerts.push({ message: msg, id: `dummy-${ticket.id}-${idx}` });
          }
        } 
        else if (!ticket.isDummy && depDate >= now && depDate <= fortyEightHoursFromNow) {
          const msg = `✈️ ${ticket.pnr}${legInfo} - Flight ${seg.origin}→${seg.destination} departs in <48h.`;
          if (!notifications.some(n => n.message === msg)) {
            newAlerts.push({ message: msg, id: `flight-${ticket.id}-${idx}` });
          }
        }
      });
    });

    if (newAlerts.length > 0) {
      setNotifications(prev => [
        ...newAlerts.map(a => ({
          id: a.id + '-' + Math.random().toString(36).substr(2, 5),
          message: a.message,
          time: new Date()
        })),
        ...prev
      ].slice(0, 30));
    }
  }, [tickets, notifications.length]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addNotification = (message: string) => {
    setNotifications(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date()
    }, ...prev].slice(0, 30));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSessionUser(null);
    setTickets([]);
    setCustomers([]);
    setSuppliers([]);
    setNotifications([]);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleSaveTicket = async (ticket: Ticket) => {
    try {
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
      
      const successMsg = `Ticket ${ticket.pnr} (${ticket.airline}) ${editingTicket ? 'updated' : 'saved'} successfully.`;
      showToast(successMsg);
      addNotification(successMsg);

      await loadData();
      setEditingTicket(null);
      setCurrentView(AppView.TICKETS);
    } catch (err: any) {
      showToast(err.message || 'Failed to save ticket', 'error');
    }
  };

  const deleteTicket = async (id: string) => {
    const ticket = tickets.find(t => t.id === id);
    if (ticket?.ticketFilePath) {
      await supabase.storage.from('app-files').remove([ticket.ticketFilePath]);
    }
    await supabase.from('tickets').delete().eq('id', id);
    setTickets(prev => prev.filter(t => t.id !== id));
    showToast('Ticket deleted successfully');
    addNotification(`Ticket ${ticket?.pnr} removed from system.`);
  };

  const updateTicketFromList = async (updatedTicket: Ticket) => {
    await supabase.from('tickets').update({
      reminder_sent: updatedTicket.reminderSent,
      status: updatedTicket.status
    }).eq('id', updatedTicket.id);
    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

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
      setEditingTicket(null);
    }
    setCurrentView(view);
  };

  const addCustomer = async (customer: Customer) => {
    // Duplicate check
    const exists = customers.some(c => c.name.trim().toLowerCase() === customer.name.trim().toLowerCase());
    if (exists) {
      showToast(`Customer "${customer.name}" already exists!`, 'error');
      return undefined;
    }

    const { data } = await supabase.from('customers').insert([{ name: customer.name, phone: customer.phone }]).select();
    if (data) {
      setCustomers(prev => [...prev, data[0]]);
      showToast(`Customer ${customer.name} added`);
      addNotification(`New customer added: ${customer.name}`);
      return data[0];
    }
  };

  const updateCustomer = async (updated: Customer) => {
    const oldCustomer = customers.find(c => c.id === updated.id);
    if (!oldCustomer) return;

    // Duplicate check against OTHER customers
    const exists = customers.some(c => c.id !== updated.id && c.name.trim().toLowerCase() === updated.name.trim().toLowerCase());
    if (exists) {
      showToast(`Another customer with name "${updated.name}" already exists!`, 'error');
      return;
    }

    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    
    if (oldCustomer.name !== updated.name) {
      setTickets(prev => prev.map(t => 
        t.customerName === oldCustomer.name ? { ...t, customerName: updated.name } : t
      ));
    }

    try {
      const { error } = await supabase.from('customers').update({ name: updated.name, phone: updated.phone }).eq('id', updated.id);
      
      if (!error && oldCustomer.name !== updated.name) {
        await supabase.from('tickets').update({ customer_name: updated.name }).eq('customer_name', oldCustomer.name);
      }
      
      showToast(`Customer "${updated.name}" updated successfully`);
    } catch (err) {
      console.error("Update customer error:", err);
      showToast("Sync error. Please refresh.", "error");
      loadData(); 
    }
  };

  const deleteCustomer = async (id: string) => {
    await supabase.from('customers').delete().eq('id', id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    showToast(`Customer removed`);
  };
  
  const addSupplier = async (supplier: Supplier) => {
    // Duplicate check
    const exists = suppliers.some(s => s.name.trim().toLowerCase() === supplier.name.trim().toLowerCase());
    if (exists) {
      showToast(`Supplier "${supplier.name}" already exists!`, 'error');
      return undefined;
    }

    const { data } = await supabase.from('suppliers').insert([{ name: supplier.name, contact: supplier.contact }]).select();
    if (data) {
      setSuppliers(prev => [...prev, data[0]]);
      showToast(`Supplier ${supplier.name} added`);
      addNotification(`New supplier added: ${supplier.name}`);
      return data[0];
    }
  };

  const updateSupplier = async (updated: Supplier) => {
    const oldSupplier = suppliers.find(s => s.id === updated.id);
    if (!oldSupplier) return;

    // Duplicate check against OTHER suppliers
    const exists = suppliers.some(s => s.id !== updated.id && s.name.trim().toLowerCase() === updated.name.trim().toLowerCase());
    if (exists) {
      showToast(`Another supplier with name "${updated.name}" already exists!`, 'error');
      return;
    }

    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));

    if (oldSupplier.name !== updated.name) {
      setTickets(prev => prev.map(t => 
        t.supplierName === oldSupplier.name ? { ...t, supplierName: updated.name } : t
      ));
    }

    try {
      const { error } = await supabase.from('suppliers').update({ name: updated.name, contact: updated.contact }).eq('id', updated.id);
      
      if (!error && oldSupplier.name !== updated.name) {
        await supabase.from('tickets').update({ supplier_name: updated.name }).eq('supplier_name', oldSupplier.name);
      }
      
      showToast(`Supplier "${updated.name}" updated successfully`);
    } catch (err) {
      console.error("Update supplier error:", err);
      showToast("Sync error. Please refresh.", "error");
      loadData(); 
    }
  };

  const deleteSupplier = async (id: string) => {
    await supabase.from('suppliers').delete().eq('id', id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
    showToast(`Supplier removed`);
  };

  const stats = useMemo(() => {
    const totalSales = tickets.reduce((sum, t) => sum + (Number(t.salesPrice) || 0), 0);
    const totalPurchase = tickets.reduce((sum, t) => sum + (Number(t.purchasePrice) || 0), 0);
    const totalProfit = tickets.reduce((sum, t) => sum + (Number(t.profit) || 0), 0);
    const dummyCount = tickets.filter(t => t.isDummy).length;
    
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    
    // Count all segments across all tickets that fall in 48h
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
      totalTickets: tickets.length, 
      totalSales, 
      totalPurchase, 
      totalProfit, 
      upcomingFlights: upcomingSegmentsCount, 
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

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={handleSetView}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      user={sessionUser}
      onSignOut={handleSignOut}
      notifications={notifications}
      onClearNotifications={() => setNotifications([])}
    >
      {toast && (
        <div className="fixed top-6 right-6 z-[200] animate-slideDown">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-600 border-emerald-500 text-white' 
              : 'bg-rose-600 border-rose-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
            <p className="text-sm font-bold tracking-tight">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {currentView === AppView.DASHBOARD && <Dashboard stats={stats} tickets={tickets} onViewTicket={handleViewTicket} onSeeAll={() => setCurrentView(AppView.TICKETS)} />}
      {currentView === AppView.TICKETS && (
        <TicketList 
          tickets={tickets} 
          onDelete={deleteTicket} 
          onUpdate={updateTicketFromList} 
          onEdit={handleEditTicket} 
          onView={handleViewTicket}
          onAdd={() => handleSetView(AppView.NEW_TICKET)}
        />
      )}
      {currentView === AppView.NEW_TICKET && (
        <TicketForm 
          onSave={handleSaveTicket} 
          customers={customers} 
          suppliers={suppliers} 
          editTicket={editingTicket || undefined} 
          sessionUser={sessionUser} 
          onAddCustomer={addCustomer}
          onAddSupplier={addSupplier}
        />
      )}
      {currentView === AppView.VIEW_TICKET && viewingTicket && (
        <BookingDetails ticket={viewingTicket} onBack={() => setCurrentView(AppView.TICKETS)} onEdit={handleEditTicket} />
      )}
      {currentView === AppView.CUSTOMERS && <Management type="Customer" items={customers} onAdd={addCustomer} onUpdate={updateCustomer} onDelete={deleteCustomer} />}
      {currentView === AppView.SUPPLIERS && <Management type="Supplier" items={suppliers} onAdd={addSupplier} onUpdate={updateSupplier} onDelete={deleteSupplier} />}
    </Layout>
  );
};

export default App;