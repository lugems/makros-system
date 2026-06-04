import { StaffMember } from './staff';

export type AuditLogAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'VIEW' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORT' 
  | 'REMINDER';

export interface ChangedField {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  module: string;
  recordId: string;
  description: string;
  createdAt: any; 
  user?: StaffMember;
  ipAddress?: string;
  userAgent?: string;
  changedFields?: ChangedField[];
}
