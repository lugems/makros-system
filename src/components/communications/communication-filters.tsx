'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Tag, AlertTriangle, ArrowRightLeft, Activity, Users, CalendarDays } from 'lucide-react';
import { CommunicationChannel, CommunicationPriority, CommunicationDirection, CommunicationStatus } from '@/types/communication';
import { UserRole } from '@/types/staff';
import { cn } from '@/lib/utils';

interface CommunicationFiltersProps {
  onSearch: (value: string) => void;
  onChannelChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onDateIntervalChange: (value: string) => void;
  
  channel: string;
  priority: string;
  direction: string;
  status: string;
  role: string;
  dateInterval: string;
}

const CHANNELS: CommunicationChannel[] = ["In-App", "Phone Call", "SMS", "WhatsApp", "Email", "Walk-In", "Internal Note"];
const PRIORITIES: CommunicationPriority[] = ["Low", "Normal", "High", "Urgent"];
const DIRECTIONS: CommunicationDirection[] = ["Internal", "Incoming", "Outgoing"];
const STATUSES: CommunicationStatus[] = ["Open", "Pending Response", "Resolved", "Closed"];
const ROLES: UserRole[] = ["Makros System Owner", "Workshop Manager", "Receptionist", "Mechanic", "Inventory Officer", "Accountant", "Customer"];
const INTERVALS = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7" },
    { label: "Last 30 Days", value: "last30" },
    { label: "This Month", value: "thisMonth" },
    { label: "All Time", value: "all" },
];

export function CommunicationFilters({ 
  onSearch, 
  onChannelChange, 
  onPriorityChange, 
  onDirectionChange,
  onStatusChange,
  onRoleChange,
  onDateIntervalChange,
  channel,
  priority,
  direction,
  status,
  role,
  dateInterval
}: CommunicationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-3xl shadow-sm">
        <div className="relative flex-grow w-full lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search subject, content, plate, IDs or names..."
            className="pl-11 bg-background h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium text-sm"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[140px] border-none font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Status</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <Tag className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={channel} onValueChange={onChannelChange}>
              <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[140px] border-none font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="Protocol" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Protocols</SelectItem>
                {CHANNELS.map(c => <SelectItem key={c} value={c} className="text-[10px] font-bold uppercase">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-1 md:flex-none">
            <AlertTriangle className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={priority} onValueChange={onPriorityChange}>
              <SelectTrigger className="bg-background h-12 rounded-2xl shadow-sm min-w-[130px] border-none font-bold uppercase text-[10px] tracking-widest">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50">
                <SelectItem value="all" className="text-[10px] font-bold uppercase">All Priorities</SelectItem>
                {PRIORITIES.map(p => <SelectItem key={p} value={p} className="text-[10px] font-bold uppercase">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/20 border border-dashed border-border/50 rounded-3xl">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <Users className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={role} onValueChange={onRoleChange}>
                    <SelectTrigger className="bg-background h-11 rounded-2xl shadow-sm min-w-[180px] border-none font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="all" className="text-[10px] font-bold uppercase">All Functional Roles</SelectItem>
                        {ROLES.map(r => <SelectItem key={r} value={r} className="text-[10px] font-bold uppercase">{r}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 flex-1 md:flex-none">
                <CalendarDays className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select value={dateInterval} onValueChange={onDateIntervalChange}>
                    <SelectTrigger className="bg-background h-11 rounded-2xl shadow-sm min-w-[160px] border-none font-bold uppercase text-[10px] tracking-widest">
                        <SelectValue placeholder="Temporal Range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50">
                        {INTERVALS.map(i => <SelectItem key={i.value} value={i.value} className="text-[10px] font-bold uppercase">{i.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          
          <div className="flex-1 flex items-center gap-3 justify-end px-2">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em]">
                <ArrowRightLeft className="h-3 w-3" /> Direction: 
            </div>
            <div className="flex bg-background p-1 rounded-xl shadow-sm">
                {["all", ...DIRECTIONS].map(d => (
                    <button 
                        key={d}
                        onClick={() => onDirectionChange(d)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                            direction === d ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {d === 'all' ? 'Unified' : d}
                    </button>
                ))}
            </div>
          </div>
      </div>
    </div>
  );
}
