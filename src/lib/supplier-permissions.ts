'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/staff';

const permissions: Record<UserRole, string[]> = {
  'Makros System Owner': ['create', 'edit', 'delete', 'view', 'deactivate', 'view_items'],
  'Workshop Manager': ['create', 'edit', 'delete', 'view', 'deactivate', 'view_items'],
  'Inventory Officer': ['create', 'edit', 'delete', 'view', 'deactivate', 'view_items'],
  'Accountant': ['view', 'view_stock_value', 'view_purchase_reports'],
  'Receptionist': [], 
  'Senior Mechanic / Lead Mechanic': [],
  'Mechanic': [],
  'Diagnostic Technician': [],
  'Auto-Wiring Technician': [],
  'Welding Lead Technician': [],
  'Welding Technician': [],
  'Auto Body / Panel Beater': [],
  'Painter': [],
  'Tyre & Wheel Technician': [],
  'Car Wash / Detailing Technician': [],
  'Quality Control Officer': [],
  'Customer': [],
};

const SupplierPermissionsContext = createContext<string[] | undefined>(
  undefined
);

export const useSupplierPermissions = () => {
  const context = useContext(SupplierPermissionsContext);
  if (context === undefined) {
    throw new Error(
      'useSupplierPermissions must be used within a SupplierPermissionsProvider'
    );
  }
  return context;
};

export const SupplierPermissionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { role } = useAuth();
  
  // Safe role check to avoid indexing with undefined
  const userPermissions = useMemo(() => {
      if (!role) return [];
      return permissions[role] || [];
  }, [role]);

  return React.createElement(
    SupplierPermissionsContext.Provider,
    { value: userPermissions },
    children
  );
};

export const hasSupplierPermission = (
  userPermissions: string[],
  permission: string
) => {
  return userPermissions.includes(permission);
};
