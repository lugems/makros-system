import { create } from 'zustand';
import { makrosMockData } from '@/data/mock-data';
import { StaffMember } from '@/types/staff';
import { Customer } from '@/types/customer';
import { Vehicle } from '@/types/vehicle';
import { Booking } from '@/types/booking';
import { JobCard, JobTask, JobPart } from '@/types/job-card';
import { InventoryItem } from '@/types/inventory';
import { Invoice } from '@/types/invoice';
import { Payment } from '@/types/payment';
import { WorkshopSettings } from '@/types/settings';
import { MakrosService } from '@/types/makros-service';
import { Supplier } from '@/types/supplier';

interface MakrosState {
  currentUser: StaffMember | null;
  users: StaffMember[];
  customers: Customer[];
  vehicles: Vehicle[];
  bookings: Booking[];
  services: MakrosService[];
  jobCards: JobCard[];
  jobTasks: JobTask[];
  jobParts: JobPart[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  payments: Payment[];
  suppliers: Supplier[];
  workshopSettings: WorkshopSettings;
  dashboardStats: any[];
  revenueChart: any[];
  
  // Auth Actions
  setCurrentUser: (user: StaffMember) => void;

  // Staff Actions
  setUsers: (users: StaffMember[]) => void;
  addUser: (user: StaffMember) => void;
  updateUser: (userId: string, updatedUser: Partial<StaffMember>) => void;
  deactivateUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Customer Actions
  createCustomer: (customer: Customer) => void;
  editCustomer: (customerId: string, updatedCustomer: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;

  // Vehicle Actions
  registerVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicleId: string, updatedVehicle: Partial<Vehicle>) => void;
  deactivateVehicle: (vehicleId: string) => void;
  activateVehicle: (vehicleId: string) => void;
  deleteVehicle: (vehicleId: string) => void;

  // Service Actions
  addService: (service: MakrosService) => void;
  updateService: (serviceId: string, updatedService: Partial<MakrosService>) => void;
  deleteService: (serviceId: string) => void;

  // Booking Actions
  createBooking: (booking: Booking) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;

  // Job Card Actions
  createJobCard: (jobCard: JobCard) => void;
  updateJobCard: (jobCard: JobCard) => void;
  deleteJobCard: (jobCardId: string) => void;
  assignMechanic: (jobCardId: string, mechanicId: string) => void;

  // Job Task Actions
  addJobTask: (jobTask: JobTask) => void;
  updateJobTask: (jobTaskId: string, updatedTask: Partial<JobTask>) => void;
  deleteJobTask: (jobTaskId: string) => void;

  // Job Part Actions
  addJobPart: (jobPart: JobPart) => void;
  updateJobPart: (jobPartId: string, updatedPart: Partial<JobPart>) => void;
  deleteJobPart: (jobPartId: string) => void;

  // Inventory Actions
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (itemId: string, updatedItem: Partial<InventoryItem>) => void;
  deleteInventoryItem: (itemId: string) => void;
  deductInventory: (itemId: string, quantity: number) => void;

  // Supplier Actions
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplierId: string, updatedSupplier: Partial<Supplier>) => void;
  deleteSupplier: (supplierId: string) => void;

  // Invoice Actions
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;

  // Payment Actions
  addPayment: (payment: Payment) => void;
  updatePaymentStatus: (invoiceId: string, status: string) => void;

  // Settings Actions
  updateWorkshopSettings: (settings: Partial<WorkshopSettings>) => void;
}

const useMakrosStore = create<MakrosState>((set) => ({
  ...makrosMockData,
  currentUser: makrosMockData.users[0],

  setCurrentUser: (user) => set({ currentUser: user }),

  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (userId, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.userId === userId ? { ...user, ...updatedUser, updatedAt: new Date().toISOString() } : user
      ),
    })),
    deactivateUser: (userId) =>
    set((state) => ({
        users: state.users.map((user) =>
        user.userId === userId ? { ...user, status: 'Inactive' } : user
        ),
    })),
    activateUser: (userId) =>
    set((state) => ({
        users: state.users.map((user) =>
        user.userId === userId ? { ...user, status: 'Active' } : user
        ),
    })),
    deleteUser: (userId) => set((state) => ({
      users: state.users.filter(u => u.userId !== userId)
    })),

  createCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
  editCustomer: (customerId, updatedCustomer) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.customerId === customerId ? { ...c, ...updatedCustomer, updatedAt: new Date().toISOString() } : c
      ),
    })),
  deleteCustomer: (customerId) => set((state) => ({
    customers: state.customers.filter(c => c.customerId !== customerId)
  })),

  registerVehicle: (vehicle) => set((state) => ({ vehicles: [vehicle, ...state.vehicles] })),
  updateVehicle: (vehicleId, updatedVehicle) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.vehicleId === vehicleId ? { ...v, ...updatedVehicle, updatedAt: new Date().toISOString() } : v
      ),
    })),
  deactivateVehicle: (vehicleId) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.vehicleId === vehicleId ? { ...v, status: 'Inactive' } : v
      ),
    })),
  activateVehicle: (vehicleId) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) =>
        v.vehicleId === vehicleId ? { ...v, status: 'Active' } : v
      ),
    })),
  deleteVehicle: (vehicleId) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.vehicleId !== vehicleId)
  })),

  addService: (service) => set((state) => ({ services: [service, ...state.services] })),
  updateService: (serviceId, updatedService) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.serviceId === serviceId ? { ...s, ...updatedService, updatedAt: new Date().toISOString() } : s
      ),
    })),
  deleteService: (serviceId) => set((state) => ({
    services: state.services.filter(s => s.serviceId !== serviceId)
  })),

  createBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
  updateBookingStatus: (bookingId, status) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.bookingId === bookingId ? { ...b, status, updatedAt: new Date().toISOString() } : b
      ),
    })),

  createJobCard: (jobCard) => set((state) => ({ jobCards: [jobCard, ...state.jobCards] })),
  updateJobCard: (jobCard) => set((state) => ({
      jobCards: state.jobCards.map(jc => jc.jobCardId === jobCard.jobCardId ? { ...jc, ...jobCard, updatedAt: new Date().toISOString() } : jc)
  })),
  deleteJobCard: (jobCardId) => set((state) => ({
      jobCards: state.jobCards.filter(jc => jc.jobCardId !== jobCardId)
  })),
  assignMechanic: (jobCardId, mechanicId) =>
    set((state) => ({
      jobCards: state.jobCards.map((j) =>
        j.jobCardId === jobCardId ? { ...j, assignedMechanicId: mechanicId, updatedAt: new Date().toISOString() } : j
      ),
    })),

  addJobTask: (jobTask) => set((state) => ({ jobTasks: [...state.jobTasks, jobTask] })),
  updateJobTask: (jobTaskId, updatedTask) => set((state) => ({
      jobTasks: state.jobTasks.map(jt => jt.jobTaskId === jobTaskId ? { ...jt, ...updatedTask, updatedAt: new Date().toISOString() } : jt)
  })),
  deleteJobTask: (jobTaskId) => set((state) => ({
      jobTasks: state.jobTasks.filter(jt => jt.jobTaskId !== jobTaskId)
  })),

  addJobPart: (jobPart) => set((state) => ({ jobParts: [...state.jobParts, jobPart] })),
  updateJobPart: (jobPartId, updatedPart) => set((state) => ({
      jobParts: state.jobParts.map(jp => jp.jobPartId === jobPartId ? { ...jp, ...updatedPart } : jp)
  })),
  deleteJobPart: (jobPartId) => set((state) => ({
      jobParts: state.jobParts.filter(jp => jp.jobPartId !== jobPartId)
  })),

  addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  updateInventoryItem: (itemId, updatedItem) =>
    set((state) => ({
      inventory: state.inventory.map((item) =>
        item.itemId === itemId ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() } : item
      ),
    })),
  deleteInventoryItem: (itemId) => set((state) => ({
    inventory: state.inventory.filter(i => i.itemId !== itemId)
  })),
  deductInventory: (itemId, quantity) =>
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i
      ),
    })),

  addSupplier: (supplier) => set((state) => ({ suppliers: [supplier, ...state.suppliers] })),
  updateSupplier: (supplierId, updatedSupplier) => set((state) => ({
    suppliers: state.suppliers.map(s => s.supplierId === supplierId ? { ...s, ...updatedSupplier, updatedAt: new Date().toISOString() } : s)
  })),
  deleteSupplier: (supplierId) => set((state) => ({
    suppliers: state.suppliers.filter(s => s.supplierId !== supplierId)
  })),

  addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
  updateInvoice: (invoice) => set((state) => ({
      invoices: state.invoices.map(i => i.invoiceId === invoice.invoiceId ? invoice : i)
  })),

  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  updatePaymentStatus: (invoiceId, status) =>
    set((state) => ({
      invoices: state.invoices.map((i) =>
        i.invoiceId === invoiceId ? { ...i, paymentStatus: status as any } : i
      ),
    })),

    updateWorkshopSettings: (updatedSettings) =>
    set((state) => ({
        workshopSettings: { ...state.workshopSettings, ...updatedSettings, updatedAt: new Date().toISOString() }
    })),
}));

export default useMakrosStore;
