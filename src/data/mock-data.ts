import type { StaffMember } from "@/types/staff";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";
import type { Booking } from "@/types/booking";
import { JobCardStatus } from "@/types/job-card";
import type { JobCard } from "@/types/job-card";
import type { InventoryItem } from "@/types/inventory";
import type { Invoice, PaymentStatus } from "@/types/invoice";
import type { AuditLog } from "@/types/audit-log";
import type { MakrosService } from "@/types/makros-service";
import type { Payment } from "@/types/payment";
import type { WorkshopSettings } from "@/types/settings";
import type { Notification } from "@/types/notification";
import type { CommunicationLog } from "@/types/communication";

export const mockUsers: StaffMember[] = [
  {
    userId: "7fxmTIFPAnb5h6ZAyol4",
    fullName: "Lugemwa Nicholas",
    phone: "+256787123161",
    email: "lugems@makrossystem.com",
    role: "Makros System Owner",
    status: "Active",
    createdAt: "2026-05-30T06:58:30Z",
    updatedAt: "2026-05-30T06:58:56Z",
    specialization: "Management",
    address: "Kampala, Uganda"
  },
  {
    userId: "user-002",
    fullName: "Namugga Sarah",
    phone: "+256 701 445 221",
    email: "sarah@makros.ug",
    role: "Workshop Manager",
    status: "Active",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-20T08:00:00Z",
    address: "Kampala, Uganda"
  },
  {
    userId: "user-003",
    fullName: "Mugisha Paul",
    phone: "+256 755 908 444",
    email: "paul@makros.ug",
    role: "Mechanic",
    status: "Active",
    createdAt: "2026-05-02T08:00:00Z",
    updatedAt: "2026-05-20T08:00:00Z",
    specialization: "Engine Diagnostics",
    assignedJobs: 3,
    completedJobs: 124,
    currentWorkload: 3,
    address: "Kampala, Uganda"
  },
  {
    userId: "user-004",
    fullName: "Achieng Mercy",
    phone: "+256 702 111 333",
    email: "mercy@makros.ug",
    role: "Receptionist",
    status: "Active",
    createdAt: "2026-05-02T08:00:00Z",
    updatedAt: "2026-05-20T08:00:00Z",
    address: "Kampala, Uganda"
  },
  {
    userId: "user-006",
    fullName: "Nabirye Grace",
    phone: "+256 703 444 555",
    email: "grace@makros.ug",
    role: "Accountant",
    status: "Active",
    createdAt: "2026-05-03T08:00:00Z",
    updatedAt: "2026-05-20T08:00:00Z",
    address: "Kampala, Uganda"
  },
];

export const mockCustomers: Customer[] = [
  {
    customerId: "cust-001",
    fullName: "Muwanga Joseph",
    phone: "+256 700 111 222",
    email: "joseph.muwanga@gmail.com",
    address: "Ntinda, Kampala",
    status: "Active",
    createdAt: "2026-05-05T09:00:00Z",
    updatedAt: "2026-05-20T09:00:00Z",
  },
];

export const mockVehicles: Vehicle[] = [
  {
    vehicleId: "veh-001",
    customerId: "cust-001",
    numberPlate: "UBN 245K",
    make: "Toyota",
    model: "Premio",
    year: 2014,
    vin: "NZT260-884421",
    status: "Active",
    createdAt: "2026-05-05T09:30:00Z",
    updatedAt: "2026-05-20T09:30:00Z",
  },
];

export const mockServices: MakrosService[] = [
  {
    serviceId: "svc-001",
    serviceName: "General Service",
    category: "General Service",
    description: "Oil change, filter replacement, and general inspection.",
    defaultLaborCost: 80000,
    estimatedDuration: "2 hours",
    status: "Active",
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-01T08:00:00Z",
  },
];

export const mockBookings: Booking[] = [
  {
    bookingId: "book-001",
    customerId: "cust-001",
    assetId: "veh-001",
    assetType: "Vehicle",
    vehicleId: "veh-001",
    serviceId: "svc-001",
    bookingDate: "2026-05-28",
    preferredTime: "09:00",
    status: "Confirmed",
    createdAt: "2026-05-25T10:00:00Z",
    updatedAt: "2026-05-26T10:00:00Z",
  },
];

export const mockJobCards: JobCard[] = [
  {
    jobCardId: "job-001",
    customerId: "cust-001",
    assetId: "veh-001",
    assetType: "Vehicle",
    vehicleId: "veh-001",
    bookingId: "book-001",
    assignedMechanicId: "user-003",
    reportedIssue: "Vehicle needs general service.",
    status: JobCardStatus.InProgress,
    laborCost: 120000,
    receivedAt: "2026-05-28T09:10:00Z",
    createdAt: "2026-05-28T09:10:00Z",
    updatedAt: "2026-05-28T10:30:00Z",
    createdBy: "user-003",
  },
];

export const mockInventory: InventoryItem[] = [
  {
    itemId: "item-001",
    itemName: "Engine Oil 5W-30",
    category: "Fluids & Lubricants",
    status: "Active",
    supplierId: "sup-001",
    quantity: 18,
    purchasePrice: 65000,
    sellingPrice: 85000,
    reorderLevel: 5,
    createdAt: "2026-05-01T08:00:00Z",
    updatedAt: "2026-05-20T08:00:00Z",
  },
];

export const mockInvoices: Invoice[] = [
  {
    invoiceId: "inv-001",
    invoiceNumber: "INV-1001",
    jobCardId: "job-001",
    customerId: "cust-001",
    laborTotal: 120000,
    partsTotal: 85000,
    discount: 5000,
    tax: 0,
    grandTotal: 200000,
    amountPaid: 200000,
    balance: 0,
    paymentStatus: "Paid" as PaymentStatus,
    issuedAt: "2026-05-28T16:30:00Z",
    dueDate: "2026-05-28",
    createdAt: "2026-05-28T16:30:00Z",
    updatedAt: "2026-05-28T17:00:00Z",
  },
];

export const mockPayments: Payment[] = [
  {
    paymentId: "pay-001",
    invoiceId: "inv-001",
    customerId: "cust-001",
    amount: 200000,
    method: "Cash",
    transactionRef: "CASH-001",
    status: "Completed",
    paidAt: "2026-05-28T17:00:00Z",
    createdAt: "2026-05-28T17:00:00Z",
    createdBy: "7fxmTIFPAnb5h6ZAyol4",
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    logId: "log-001",
    userId: "7fxmTIFPAnb5h6ZAyol4",
    action: "CREATE",
    module: "Customers",
    recordId: "cust-001",
    description: "Enrolled new client: Muwanga Joseph",
    createdAt: "2026-05-05T09:00:00Z",
  },
];

export const mockCommunicationLogs: CommunicationLog[] = [
  {
    logId: "comm-001",
    subject: "Booking confirmation for UBN 245K",
    message: "Customer confirmed arrival for 9:00 AM.",
    channel: "Phone Call",
    direction: "Outgoing",
    priority: "Normal",
    status: "Resolved",
    fromUserId: "user-004",
    fromRole: "Receptionist",
    fromName: "Achieng Mercy",
    toRole: "Customer",
    toName: "Muwanga Joseph",
    customerId: "cust-001",
    vehicleId: "veh-001",
    bookingId: "book-001",
    requiresFollowUp: false,
    isCustomerVisible: true,
    isInternalOnly: false,
    createdAt: "2026-05-28T08:30:00Z",
    updatedAt: "2026-05-28T08:45:00Z",
    createdBy: "user-004",
    module: "General"
  },
  {
    logId: "comm-002",
    subject: "Engine noise inspection update",
    message: "Engine mount appears weak. Recommend customer approval before replacement.",
    channel: "Internal Note",
    direction: "Internal",
    priority: "High",
    status: "Open",
    fromUserId: "user-003",
    fromRole: "Mechanic",
    fromName: "Mugisha Paul",
    toUserId: "user-002",
    toRole: "Workshop Manager",
    toName: "Namugga Sarah",
    customerId: "cust-001",
    vehicleId: "veh-001",
    jobCardId: "job-001",
    requiresFollowUp: true,
    followUpDate: "2026-05-29",
    isCustomerVisible: false,
    isInternalOnly: true,
    createdAt: "2026-05-28T10:20:00Z",
    updatedAt: "2026-05-28T10:20:00Z",
    createdBy: "user-003",
    module: "Job Card"
  },
  {
    logId: "comm-003",
    subject: "Balance payment reminder",
    message: "Customer reminded about UGX 145,000 outstanding balance.",
    channel: "WhatsApp",
    direction: "Outgoing",
    priority: "High",
    status: "Pending Response",
    fromUserId: "user-006",
    fromRole: "Accountant",
    fromName: "Nabirye Grace",
    toRole: "Customer",
    toName: "Muwanga Joseph",
    customerId: "cust-001",
    invoiceId: "inv-002",
    requiresFollowUp: true,
    followUpDate: "2026-05-30",
    isCustomerVisible: true,
    isInternalOnly: false,
    createdAt: "2026-05-28T12:40:00Z",
    updatedAt: "2026-05-28T12:40:00Z",
    createdBy: "user-006",
    module: "Invoicing"
  },
];

export const mockNotifications: Notification[] = [
  {
    logId: "note-001",
    subject: "Repair Bay Entry",
    message: "Hello Joseph, your vehicle is now in the repair bay.",
    channel: "SMS",
    direction: "Outgoing",
    priority: "Normal",
    status: "Resolved",
    customerId: "cust-001",
    requiresFollowUp: false,
    isCustomerVisible: true,
    isInternalOnly: false,
    createdAt: "2026-05-28T09:15:00Z",
    updatedAt: "2026-05-28T09:15:00Z",
    createdBy: "user-002",
  },
];

export const mockWorkshopSettings: WorkshopSettings = {
  settingsId: "workshop",
  workshopName: "Makros System Workshop",
  businessRegistrationName: "Makros System Auto Services Uganda",
  phone: "+256 772 345 111",
  email: "info@makros.ug",
  address: "Ntinda Industrial Area, Kampala",
  currency: "UGX",
  timezone: "Africa/Kampala",
  language: "English",
  taxEnabled: false,
  taxName: "VAT",
  taxRate: 18,
  defaultDiscount: 5,
  invoicePrefix: "INV",
  invoiceStartNumber: 1001,
  receiptPrefix: "REC",
  receiptStartNumber: 1001,
  receiptFooterNote: "Thank you for trusting Makros System Workshop.",
  paymentMethods: {
    cash: true,
    mobileMoney: true,
    bankTransfer: true,
    card: false,
    credit: false,
  },
  notifications: {
    sms: true,
    email: true,
    whatsapp: false,
    inApp: true,
    bookingReminders: true,
    jobStatusUpdates: true,
    paymentReminders: true,
    serviceReminders: true,
    lowStockAlerts: true,
  },
  operatingHours: [
    { day: "Monday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Tuesday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Wednesday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Thursday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Friday", open: true, openingTime: "08:00", closingTime: "18:00" },
    { day: "Saturday", open: true, openingTime: "09:00", closingTime: "15:00" },
    { day: "Sunday", open: false, openingTime: "00:00", closingTime: "00:00" },
  ],
  inventoryAlerts: {
    lowStockEnabled: true,
    notifyInventoryOfficer: true,
    notifyWorkshopManager: true,
  },
  createdAt: "2026-05-01T08:00:00Z",
  updatedAt: "2026-05-28T08:00:00Z",
};

export const makrosMockData = {
  users: mockUsers,
  customers: mockCustomers,
  vehicles: mockVehicles,
  services: mockServices,
  bookings: mockBookings,
  jobCards: mockJobCards,
  inventory: mockInventory,
  invoices: mockInvoices,
  payments: mockPayments,
  auditLogs: mockAuditLogs,
  communicationLogs: mockCommunicationLogs,
  notifications: mockNotifications,
  workshopSettings: mockWorkshopSettings,
  suppliers: [],
  jobTasks: [],
  jobParts: [],
  dashboardStats: [],
  revenueChart: [],
};
