'use client';

import React, { useState, useMemo } from 'react';
import { StaffMember } from '@/types/staff';
import { useMediaQuery } from '@/hooks/use-media-query';
import { RoleBadge } from '@/components/staff/role-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Fingerprint, Mail, Phone, Wrench, ChevronRight, Activity, Zap, Users as UsersIcon, MoreHorizontal, Eye, Edit, Power, PowerOff, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { EditStaffModal } from './edit-staff-modal';
import { useToast } from '@/hooks/use-toast';
import { purgeStaffRecord } from '@/services/users-service';

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (userId: string, updatedStaff: Partial<StaffMember>) => void;
  onDeactivate: (userId: string) => void;
  onActivate: (userId: string) => void;
}

export function StaffTable({ staff, onEdit, onDeactivate, onActivate }: StaffTableProps) {
  const { role: currentRole, user: currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Administrative clearance check
  const canManageRegistry = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager'].includes(currentRole || ''), 
    [currentRole]
  );
  
  const isOwner = currentRole === 'Makros System Owner';

  const handleDelete = async () => {
    if (staffToDelete && currentUser) {
        try {
            await purgeStaffRecord(staffToDelete.userId, currentUser.userId);
            toast({ title: "Personnel Purged", description: `${staffToDelete.fullName} record decommissioned.` });
            setStaffToDelete(null);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Purge Failed", description: error.message });
        }
    }
  };

  const currentEditingStaff = staff.find(s => s.userId === editingStaffId);

  return (
    <>
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
            <TableHeader>
            <TableRow className="bg-muted/50 uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground">
                <TableHead className="px-6 py-4 text-left">Personnel & Specialization</TableHead>
                <TableHead className="px-6 py-4 text-left">Classification</TableHead>
                <TableHead className="px-6 py-4 text-left">Registry Status</TableHead>
                <TableHead className="px-6 py-4 text-left">Reach</TableHead>
                <TableHead className="px-6 py-4 text-right">Operational Load</TableHead>
                <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {staff.map((s) => (
                <TableRow 
                key={s.userId} 
                className="hover:bg-muted/30 transition-colors group cursor-pointer"
                onClick={() => router.push(`/staff/${s.userId}`)}
                >
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/5 shadow-sm">
                            <AvatarImage src={`https://picsum.photos/seed/${s.userId}/100/100`} />
                            <AvatarFallback className="font-black text-[10px] bg-primary/5 text-primary">{s.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                            <p className="text-sm font-black group-hover:text-primary transition-colors uppercase tracking-tight leading-none">{s.fullName}</p>
                            <div className="flex items-center gap-1.5 pt-1">
                                <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                                <span className="text-[9px] font-mono text-muted-foreground font-black uppercase tracking-tighter">
                                    {s.userId.toUpperCase().slice(-8)}
                                </span>
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4"><RoleBadge role={s.role} /></TableCell>
                <TableCell className="px-6 py-4">
                    <Badge variant={s.status === 'Active' ? 'success' : 'destructive'} className="text-[9px] font-black uppercase tracking-widest px-2.5 shadow-sm">
                        {s.status}
                    </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80">
                            <Mail className="h-3 w-3 opacity-50" /> {s.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                            <Phone className="h-3 w-3 opacity-50" /> {s.phone}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                    {s.role === 'Mechanic' ? (
                        <div className="space-y-1">
                            <p className="text-sm font-black text-foreground">{s.assignedJobs || 0}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Bay Jobs</p>
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">—</span>
                    )}
                </TableCell>
                <TableCell className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-[200px]">
                            <DropdownMenuItem onClick={() => router.push(`/staff/${s.userId}`)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Eye className="h-3.5 w-3.5" />
                                Inspect Dossier
                            </DropdownMenuItem>
                            
                            {(canManageRegistry || s.userId === currentUser?.userId) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setEditingStaffId(s.userId)} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Edit className="h-3.5 w-3.5" />
                                        Update Record
                                    </DropdownMenuItem>
                                </>
                            )}
                            
                            {canManageRegistry && (
                                <>
                                    <DropdownMenuSeparator />
                                    {s.status === 'Active' ? (
                                        <DropdownMenuItem 
                                            onClick={() => onDeactivate(s.userId)}
                                            className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive"
                                        >
                                            <PowerOff className="h-3.5 w-3.5" />
                                            Deactivate Authority
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem 
                                            onClick={() => onActivate(s.userId)}
                                            className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-green-600"
                                        >
                                            <Power className="h-3.5 w-3.5" />
                                            Restore Authority
                                        </DropdownMenuItem>
                                    )}
                                    
                                    {isOwner && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                onClick={() => setStaffToDelete(s)}
                                                className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Purge Record
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </div>

        {editingStaffId && currentEditingStaff && (
            <EditStaffModal 
                staff={currentEditingStaff} 
                isOpen={!!editingStaffId}
                onOpenChange={(open) => !open && setEditingStaffId(null)}
                onEdit={onEdit} 
            />
        )}

        <AlertDialog open={!!staffToDelete} onOpenChange={(open) => !open && setStaffToDelete(null)}>
            <AlertDialogContent className="rounded-3xl border-border/50">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black uppercase tracking-tight">Purge Personnel Record?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium leading-relaxed">
                        This action will permanently decommission <span className="font-bold text-foreground">{(staffToDelete as any)?.fullName}</span> from the workshop force strength. Immutable audit logs linked to this personnel ID will be preserved for security tracing.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest text-[10px] h-11 border-none text-white">Confirm Purge</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
