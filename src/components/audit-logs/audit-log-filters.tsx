'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { Search, Filter, Layers, User, Activity } from 'lucide-react';

interface AuditLogFiltersProps {
    onSearch: (value: string) => void;
    onModuleChange: (value: string) => void;
    onActionChange: (value: string) => void;
    onDateChange: (date: DateRange | undefined) => void;
    onDateFilter: (filter: string) => void;
    moduleFilter: string;
    actionFilter: string;
    dateRange: DateRange | undefined;
    userFilter: string;
    onUserChange: (value: string) => void;
    users: { userId: string; fullName: string }[];
}

/**
 * @fileOverview Standardized technical filter bar for audit log orchestration.
 */
export function AuditLogFilters({ 
    onSearch, 
    onModuleChange, 
    onActionChange, 
    onDateChange,
    onDateFilter,
    moduleFilter,
    actionFilter,
    dateRange,
    userFilter,
    onUserChange,
    users
}: AuditLogFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-2xl">
        <div className="relative flex-grow w-full lg:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
                placeholder="Search by user, action, module, or Record ID..."
                className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Layers className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={moduleFilter} onValueChange={onModuleChange}>
                    <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[150px]">
                        <SelectValue placeholder="All Modules" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-xs font-bold uppercase">System Wide</SelectItem>
                        {["Customers", "Vehicles", "Bookings", "Job Cards", "Inventory", "Invoices", "Payments", "Staff", "Settings"].map(m => (
                            <SelectItem key={m} value={m} className="text-xs font-bold uppercase">{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={actionFilter} onValueChange={onActionChange}>
                    <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[140px]">
                        <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-xs font-bold uppercase">Any Interaction</SelectItem>
                        <SelectItem value="Create" className="text-xs font-bold uppercase">Mutations: Create</SelectItem>
                        <SelectItem value="Update" className="text-xs font-bold uppercase">Mutations: Update</SelectItem>
                        <SelectItem value="Delete" className="text-xs font-bold uppercase">Mutations: Delete</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <User className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={userFilter} onValueChange={onUserChange}>
                    <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[180px]">
                        <SelectValue placeholder="All Personnel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-xs font-bold uppercase">Global Actors</SelectItem>
                        {users.map(user => (
                            <SelectItem key={user.userId} value={user.userId} className="text-xs font-bold uppercase">{user.fullName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-3 rounded-xl border border-dashed border-border/50">
        <div className="flex items-center gap-4">
            <DatePickerWithRange date={dateRange} setDate={onDateChange} />
            <div className="hidden lg:flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onDateFilter('today')} className="text-[10px] font-black uppercase tracking-widest h-8 rounded-lg">Today</Button>
                <Button variant="ghost" size="sm" onClick={() => onDateFilter('yesterday')} className="text-[10px] font-black uppercase tracking-widest h-8 rounded-lg">Yesterday</Button>
                <Button variant="ghost" size="sm" onClick={() => onDateFilter('last-7-days')} className="text-[10px] font-black uppercase tracking-widest h-8 rounded-lg">Last 7 Days</Button>
                <Button variant="ghost" size="sm" onClick={() => onDateFilter('all')} className="text-[10px] font-black uppercase tracking-widest h-8 rounded-lg">Clear Interval</Button>
            </div>
        </div>
        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] italic pr-4">Temporal parameters active for registry isolation</p>
      </div>
    </div>
  );
}