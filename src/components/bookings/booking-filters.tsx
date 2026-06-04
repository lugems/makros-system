'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Wrench, Activity } from 'lucide-react';
import { BookingStatus } from '@/types/booking';
import useMakrosStore from '@/store/makros-store';
import { MakrosService } from '@/types/makros-service';

interface BookingFiltersProps {
    onSearch: (query: string) => void;
    onFilterStatus: (status: BookingStatus | 'All') => void;
    onFilterService: (serviceId: string | 'All') => void;
}

export function BookingFilters({ onSearch, onFilterStatus, onFilterService }: BookingFiltersProps) {
    const services = useMakrosStore((state) => state.services);
    const statuses: (BookingStatus | 'All')[] = ['All', 'Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled', 'No Show'];

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-[1.75rem] shadow-sm">
            <div className="relative flex-grow w-full lg:max-w-md group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search by client name, plate, or reference..."
                    className="pl-11 bg-background h-11 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium text-sm"
                    onChange={(e) => onSearch(e.target.value)} 
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select onValueChange={(value) => onFilterStatus(value as BookingStatus | 'All')} defaultValue="All">
                        <SelectTrigger className="bg-background h-11 rounded-2xl shadow-sm min-w-[140px] border-none font-bold uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            {statuses.map(status => (
                                <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase tracking-widest">{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <Wrench className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select onValueChange={onFilterService} defaultValue="All">
                        <SelectTrigger className="bg-background h-11 rounded-2xl shadow-sm min-w-[180px] border-none font-bold uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest">All Services</SelectItem>
                            {(services || []).filter((s: MakrosService) => s.status === 'Active').map((service: MakrosService) => (
                                <SelectItem key={service.serviceId} value={service.serviceId} className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px]">
                                    {service.serviceName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}