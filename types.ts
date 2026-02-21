
export interface Passenger {
  name: string;
  eTicketNo: string;
  type?: 'ADT' | 'CHD' | 'INF';
}

export interface FlightSegment {
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNo?: string;
}

export interface Ticket {
  id: string;
  passengers: Passenger[];
  segments: FlightSegment[];
  pnr: string;
  issuedDate: string;
  airline: string;
  customerName: string;
  supplierName: string;
  salesPrice: number;
  purchasePrice: number;
  profit: number;
  isDummy: boolean;
  status: 'Confirmed' | 'Cancelled' | 'Changed';
  reminderSent: boolean;
  createdAt: string;
  ticketFilePath?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

export interface DashboardStats {
  totalTickets: number;
  totalSales: number;
  totalPurchase: number;
  totalProfit: number;
  upcomingFlights: number;
  dummyCount: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TICKETS = 'TICKETS',
  NEW_TICKET = 'NEW_TICKET',
  VIEW_TICKET = 'VIEW_TICKET',
  CUSTOMERS = 'CUSTOMERS',
  SUPPLIERS = 'SUPPLIERS'
}
