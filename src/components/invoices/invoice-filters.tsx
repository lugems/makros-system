'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar, Activity } from 'lucide-react';

interface InvoiceFiltersProps {
    onSearch: (query: string) => void;
    onFilterStatus: (status: string) => void;
    onFilterDate: (dateRange: string) => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({ onSearch, onFilterStatus, onFilterDate }) => {
    const paymentStatuses = ['All', 'Paid', 'Unpaid', 'Partially Paid', 'Overdue', 'Cancelled'];
    const dateRanges = ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month'];

    return (
        <div className="flex flex-col lg:flex-row items-center gap-4 p-4 bg-muted/30 border border-border/50 rounded-[1.5rem]">
            <div className="relative flex-grow w-full lg:max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search by client name, number plate, or Record ID..."
                    className="pl-10 bg-background h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 shadow-sm border-none font-medium"
                    onChange={(e) => onSearch(e.target.value)} 
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select onValueChange={onFilterStatus} defaultValue="All">
                        <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[150px] border-none font-bold uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            {paymentStatuses.map(status => (
                                <SelectItem key={status} value={status} className="text-[10px] font-bold uppercase tracking-widest">{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 flex-1 md:flex-none">
                    <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select onValueChange={onFilterDate} defaultValue="All Time">
                        <SelectTrigger className="bg-background h-11 rounded-xl shadow-sm min-w-[160px] border-none font-bold uppercase text-[10px] tracking-widest">
                            <SelectValue placeholder="Date Cycle" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            {dateRanges.map(range => (
                                <SelectItem key={range} value={range} className="text-[10px] font-bold uppercase tracking-widest">{range}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFilters;
