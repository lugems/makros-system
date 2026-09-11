'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Wrench, TrendingUp, Star } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

interface ServiceDemandReportProps {
  bookings: any[];
}

export function ServiceDemandReport({ bookings }: ServiceDemandReportProps) {
  const db = useFirestore();
  const { data: services } = useCollection<any>(query(collection(db, 'services')));

  const demandData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach(b => {
      counts[b.serviceId] = (counts[b.serviceId] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([id, count]) => {
        const srv = services?.find(s => s.serviceId === id);
        return {
          name: srv?.serviceName || 'Unknown Service',
          category: srv?.category || 'General',
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [bookings, services]);

  return (
    <Card className="rounded-2xl sm:rounded-[2rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow h-full">
      <CardHeader className="bg-muted/30 border-b p-4 sm:p-6 space-y-1">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" /> Service Demand
        </CardTitle>
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Most Requested Workshop Catalog Items</p>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Service Demand Cards */}
        <div className="block sm:hidden divide-y divide-border/50">
            {demandData.map((item, idx) => (
                <div key={idx} className="p-4 space-y-2 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-primary/60 shrink-0">
                                <Wrench className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <p className="text-xs font-black uppercase tracking-tight truncate">{item.name}</p>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase">{item.category}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase text-green-600 bg-green-500/5 border-green-200 shrink-0">
                            <TrendingUp className="h-2 w-2 mr-1" /> High Demand
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-border/40 text-[10px]">
                        <span className="text-[9px] font-black uppercase text-muted-foreground">Requests</span>
                        <span className="text-sm font-black text-foreground">{item.count}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10 border-none uppercase text-[9px] font-black tracking-[0.2em]">
                <TableHead className="px-6">Service Type</TableHead>
                <TableHead className="px-6 text-center">Requests</TableHead>
                <TableHead className="px-6 text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandData.map((item, idx) => (
                <TableRow key={idx} className="hover:bg-muted/30 border-border/50 group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-background border flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wrench className="h-4 w-4 text-primary/40" />
                      </div>
                      <div className="space-y-0.5">
                          <p className="text-xs font-black uppercase tracking-tight">{item.name}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">{item.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 text-center">
                      <span className="text-sm font-black text-foreground">{item.count}</span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                      <Badge variant="outline" className="text-[8px] font-black uppercase text-green-600 bg-green-500/5 border-green-200">
                          <TrendingUp className="h-2 w-2 mr-1" /> High Demand
                      </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {demandData.length === 0 && (
            <div className="py-16 sm:py-20 text-center opacity-30 italic text-xs sm:text-sm text-muted-foreground">
                No service demand data detected in intake queue.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
