export interface WorkshopSettings {
  settingsId: string;

  workshopName: string;
  businessRegistrationName?: string;
  tin?: string;
  phone: string;
  secondaryPhone?: string;
  additionalPhones?: string[];
  email: string;
  additionalEmails?: string[];
  website?: string;
  address: string;
  logoUrl?: string;

  currency: "UGX" | "USD" | "KES" | "TZS";
  timezone: string;
  language: "English" | "Swahili" | "Luganda";

  taxEnabled: boolean;
  taxName: string;
  taxRate: number;
  
  defaultDiscount: number;

  invoicePrefix: string;
  invoiceStartNumber: number;
  receiptPrefix: string;
  receiptFooterNote: string;

  paymentMethods: {
    cash: boolean;
    mobileMoney: boolean;
    bankTransfer: boolean;
    card: boolean;
    credit: boolean;
  };

  notifications: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
    inApp: boolean;
    bookingReminders: boolean;
    jobStatusUpdates: boolean;
    paymentReminders: boolean;
    serviceReminders: boolean;
    lowStockAlerts: boolean;
  };

  operatingHours: {
    day: string;
    open: boolean;
    openingTime: string;
    closingTime: string;
  }[];

  inventoryAlerts: {
    lowStockEnabled: boolean;
    notifyInventoryOfficer: boolean;
    notifyWorkshopManager: boolean;
  };

  createdAt: any;
  updatedAt: any;
}
