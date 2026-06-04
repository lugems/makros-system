'use client';

import React, { useState } from 'react';
import { StaffMember } from "@/types/staff";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditStaffModal } from '@/components/staff/edit-staff-modal';
import Link from 'next/link';

interface StaffListProps {
  staff: StaffMember[];
  onEdit: (staffId: string, staff: Partial<StaffMember>) => void;
}

export function StaffList({ staff, onEdit }: StaffListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Workload</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((s) => (
          <TableRow key={s.userId}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://picsum.photos/seed/${s.userId}/100/100`} alt={s.fullName} />
                  <AvatarFallback>{s.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{s.fullName}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{s.email}</div>
                <div className="text-muted-foreground">{s.phone}</div>
              </div>
            </TableCell>
            <TableCell>{s.role}</TableCell>
            <TableCell>
              <Badge variant={s.status === 'Active' ? 'default' : 'destructive'}>
                {s.status}
              </Badge>
            </TableCell>
            <TableCell>
              {s.role === 'Mechanic' ? (
                <div className="text-sm">
                  <div>Assigned: {s.assignedJobs || 0}</div>
                  <div>Completed: {s.completedJobs || 0}</div>
                </div>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                    <Link href={`/staff/${s.userId}`}>
                        <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(s.userId)}>Edit</Button>
                    {editingId === s.userId && (
                        <EditStaffModal 
                            staff={s} 
                            isOpen={true} 
                            onOpenChange={(open) => !open && setEditingId(null)} 
                            onEdit={onEdit} 
                        />
                    )}
                </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
