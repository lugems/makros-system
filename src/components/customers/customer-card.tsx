'use client';

import React from 'react';
import { Customer } from '@/types/customer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Fingerprint, Mail, Phone, ChevronRight, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  photoUrl?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function CustomerCard({ 
    customer, 
    photoUrl,
    onView, 
    onEdit,
    onDelete
}: CustomerCardProps) {
  const isActive = customer.status === 'Active';

  return (
    <Card className="hover:border-primary/40 transition-all group relative overflow-hidden bg-card border-border/50">
      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/5 shadow-sm">
                    <AvatarImage src={photoUrl} />
                    <AvatarFallback className="font-black text-[10px] bg-primary/10 text-primary uppercase">
                        {customer.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                        {customer.fullName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Fingerprint className="h-3 w-3 text-muted-foreground/40" />
                        <span className="text-[9px] font-mono text-muted-foreground uppercase font-bold tracking-tighter">
                            {customer.customerId.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <Badge variant={isActive ? 'success' : 'destructive'} className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                {isActive ? 'Active' : 'Inactive'}
            </Badge>
        </div>

        <div className="space-y-3">
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/80">
                    <Mail className="h-3 w-3 text-primary/50" /> {customer.email || 'NO_DIGITAL_ADDRESS'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase">
                    <Phone className="h-3 w-3 text-primary/50" /> {customer.phone}
                </div>
            </div>
            
            {customer.address && (
                <p className="text-[10px] text-muted-foreground italic leading-relaxed line-clamp-1 border-t border-border/50 pt-2">
                    {customer.address}
                </p>
            )}
        </div>

        <div className="flex gap-2 pt-1">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-9 text-[9px] font-black uppercase tracking-widest bg-background rounded-xl"
                onClick={onView}
            >
                Inspect Dossier
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl border border-border/50"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl p-1.5 shadow-xl w-48">
                    <DropdownMenuItem onClick={onView} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Eye className="h-3.5 w-3.5" /> View Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit} className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Edit className="h-3.5 w-3.5" /> Edit Record
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        onClick={onDelete} 
                        className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Left accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
    </Card>
  );
}
