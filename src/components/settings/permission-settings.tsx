'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Check, X } from 'lucide-react';

const roles = [
  { name: 'Makros System Owner', access: 'Full Control' },
  { name: 'Workshop Manager', access: 'Operational + Staff' },
  { name: 'Receptionist', access: 'Bookings + Customers' },
  { name: 'Mechanic', access: 'Assigned Job Cards' },
  { name: 'Inventory Officer', access: 'Logistics + Stock' },
  { name: 'Accountant', access: 'Fiscal + Payments' },
];

const modules = ['Dashboard', 'Customers', 'Inventory', 'Fiscal', 'Staff', 'Settings'];

const matrix: Record<string, string[]> = {
  'Makros System Owner': modules,
  'Workshop Manager': ['Dashboard', 'Customers', 'Inventory', 'Staff'],
  'Receptionist': ['Customers', 'Dashboard'],
  'Mechanic': ['Dashboard'],
  'Inventory Officer': ['Inventory', 'Dashboard'],
  'Accountant': ['Fiscal', 'Dashboard'],
};

export function PermissionSettings() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Card className="rounded-[2.5rem] overflow-hidden border-border/50 bg-card shadow-sm">
        <CardHeader className="bg-muted/30 border-b p-8">
          <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Authority Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[200px] h-14 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Functional Persona</TableHead>
                {modules.map((m) => (
                  <TableHead key={m} className="text-center h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{m}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.name} className="hover:bg-muted/5 border-border/50 transition-colors">
                  <TableCell className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-tight">{role.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{role.access}</p>
                    </div>
                  </TableCell>
                  {modules.map((m) => {
                    const hasAccess = matrix[role.name].includes(m);
                    return (
                      <TableCell key={m} className="text-center">
                        <div className="flex justify-center">
                          {hasAccess ? (
                            <div className="h-6 w-6 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                              <Check className="h-3 w-3 text-green-500" />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-lg bg-muted/30 flex items-center justify-center opacity-20">
                              <X className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}