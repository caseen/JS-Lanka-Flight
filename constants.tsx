
import React from 'react';
import { 
  LayoutDashboard, 
  Ticket as TicketIcon, 
  Users, 
  Truck, 
  PlusCircle, 
} from 'lucide-react';

export const COLORS = {
  primary: '#2563eb', // Blue
  secondary: '#f97316', // Orange
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'TICKETS', label: 'All Tickets', icon: <TicketIcon size={20} /> },
  { id: 'NEW_TICKET', label: 'Add Ticket', icon: <PlusCircle size={20} /> },
  { id: 'CUSTOMERS', label: 'Customers', icon: <Users size={20} /> },
  { id: 'SUPPLIERS', label: 'Suppliers', icon: <Truck size={20} /> },
];

export const TICKET_STATUSES = ['Confirmed', 'Cancelled', 'Changed'];
