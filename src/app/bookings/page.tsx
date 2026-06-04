'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Booking, BookingStatus } from '@/types/booking';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, List, Calendar as CalendarIcon, ClipboardList, Activity, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/layout/page-header';

import { BookingSummaryCards } from '@/components/bookings/booking-summary-cards';
import { BookingsTable } from '@/components/bookings/bookings-table';
import { BookingCard } from '@/components/bookings/booking-card';
import { BookingDetails } from '@/components/bookings/booking-details';
import { BookingFilters } from '@/components/bookings/booking-filters';
import BookingFormDialog from '@/components/bookings/booking-form-dialog';
import { BookingCalendar } from '@/components/bookings/booking-calendar';
import { LoadingState } from '@/components/shared/loading-state';
import { createBooking, updateBooking, updateBookingStatus } from '@/services/bookings-service';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

const BookingsPage: React.FC = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { toast } = useToast();
    const { user: currentUser } = useAuth();
    const db = useFirestore();
    const router = useRouter();

    const canWrite = useMemo(() => 
        currentUser && ['Makros System Owner', 'Workshop Manager', 'Receptionist'].includes(currentUser.role)
    , [currentUser]);

    // Live Registry Queries - Stabilized with useMemoFirebase
    const bookingsQuery = useMemoFirebase(() => {
        if (!db) return null;
        const base = collection(db, 'bookings');
        if (currentUser?.role === 'Customer') {
            return query(base, where('customerId', '==', currentUser.userId), orderBy('bookingDate', 'desc'));
        }
        return query(base, orderBy('bookingDate', 'desc'));
    }, [db, currentUser]);

    const { data: bookings, loading } = useCollection<Booking>(bookingsQuery as any);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'All'>('All');
    const [serviceFilter, setServiceFilter] = useState<string | 'All'>('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        let filtered = [...bookings];

        if (statusFilter !== 'All') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        if (serviceFilter !== 'All') {
            filtered = filtered.filter(b => b.serviceId === serviceFilter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(b => 
                b.bookingId.toLowerCase().includes(q) ||
                b.notes?.toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [bookings, searchQuery, statusFilter, serviceFilter]);

    // Reset pagination on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, serviceFilter, viewMode]);

    const paginatedBookings = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredBookings.slice(startIndex, startIndex + pageSize);
    }, [filteredBookings, currentPage, pageSize]);

    const selectedBooking = useMemo(() => {
        return bookings?.find(b => b.bookingId === selectedBookingId) || null;
    }, [bookings, selectedBookingId]);

    const handleCreateBooking = async (data: any) => {
        if (!currentUser) return;
        setIsActionLoading(true);
        try {
            createBooking({ ...data, status: 'Pending' }, currentUser.userId);
            setIsCreateOpen(false);
            toast({ title: "Appointment Scheduled", description: "Technical intake registry updated." });
        } catch (err) {
            toast({ variant: "destructive", title: "Intake Failed", description: "Could not synchronize with registry." });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateBooking = async (data: any) => {
        if (!currentUser || !selectedBookingId) return;
        setIsActionLoading(true);
        try {
            updateBooking(selectedBookingId, data, currentUser.userId);
            setIsEditOpen(false);
            toast({ title: "Record Synchronized", description: "Appointment parameters updated successfully." });
        } catch (err) {
            toast({ variant: "destructive", title: "Sync Failed", description: "Technical error during write protocol." });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStatusChange = useCallback(async (id: string, status: BookingStatus) => {
        if (!currentUser) return;
        try {
            updateBookingStatus(id, status, currentUser.userId);
            toast({ title: "Status Updated", description: `Appointment marked as ${status}.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Update Failed", description: "Technical error during status synchronization." });
        }
    }, [currentUser, toast]);

    const handleConvertToJobCard = useCallback(async (booking: Booking) => {
        if (!currentUser) return;
        try {
            updateBookingStatus(booking.bookingId, 'Checked In', currentUser.userId);
            router.push(`/job-cards/new?bookingId=${booking.bookingId}`);
        } catch (error) {
            toast({ variant: "destructive", title: "Transition Failed", description: "Technical error during state synchronization." });
        }
    }, [router, currentUser, toast]);

    const handleCloseDetails = () => setSelectedBookingId(null);

    // Set initial selection (Desktop only)
    useEffect(() => {
        if (!isMobile && !selectedBookingId && filteredBookings.length > 0) {
            setSelectedBookingId(filteredBookings[0].bookingId);
        }
    }, [filteredBookings, selectedBookingId, isMobile]);

    if (loading) {
        return <LoadingState />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <PageHeader title="Service Queue">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex bg-muted/50 p-1 rounded-xl border border-border/50">
                        <Button 
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setViewMode('calendar')}
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    {canWrite && (
                        <Button 
                            onClick={() => setIsCreateOpen(true)} 
                            className="gap-2 font-black uppercase tracking-[0.2em] text-[10px] h-11 px-6 shadow-lg shadow-primary/20"
                        >
                            <Plus className="h-4 w-4" /> Schedule Intake
                        </Button>
                    )}
                </div>
            </PageHeader>

            <div className={cn("space-y-8", isMobile && selectedBookingId && "hidden")}>
                <BookingSummaryCards bookings={bookings || []} />

                <BookingFilters
                    onSearch={setSearchQuery}
                    onFilterStatus={setStatusFilter}
                    onFilterService={setServiceFilter}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className={cn(
                        "space-y-4 transition-all duration-500",
                        selectedBooking && viewMode !== 'calendar' ? "lg:col-span-8" : "lg:col-span-12"
                    )}>
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5" /> Intake Dashboard
                            </h3>
                            <span className="text-[10px] font-bold text-muted-foreground/60">{filteredBookings.length} Records found</span>
                        </div>

                        {viewMode === 'list' && (
                            <BookingsTable 
                                bookings={paginatedBookings} 
                                onSelect={(b) => setSelectedBookingId(b.bookingId)}
                                selectedId={selectedBookingId}
                            />
                        )}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {paginatedBookings.map(b => (
                                    <BookingCard key={b.bookingId} booking={b} onSelect={(b) => setSelectedBookingId(b.bookingId)} />
                                ))}
                            </div>
                        )}
                        {viewMode === 'calendar' && (
                            <BookingCalendar 
                                bookings={filteredBookings} 
                                onSelect={(b) => setSelectedBookingId(b.bookingId)} 
                            />
                        )}

                        {viewMode !== 'calendar' && (
                            <DataTablePagination 
                                totalItems={filteredBookings.length}
                                pageSize={pageSize}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                            />
                        )}

                        {filteredBookings.length === 0 && viewMode !== 'calendar' && (
                            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] opacity-30 bg-muted/5 flex flex-col items-center justify-center space-y-4">
                                <ClipboardList className="h-12 w-12" />
                                <p className="text-sm font-medium italic">No technical appointments detected in the intake queue.</p>
                            </div>
                        )}
                    </div>
                    
                    {selectedBooking && !isMobile && viewMode !== 'calendar' && (
                        <div className="lg:col-span-4 sticky top-24 animate-in slide-in-from-right-4 duration-500">
                            <BookingDetails 
                                booking={selectedBooking} 
                                onClose={handleCloseDetails}
                                onStatusChange={handleStatusChange}
                                onConvertToJobCard={handleConvertToJobCard}
                                onEdit={() => setIsEditOpen(true)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <BookingFormDialog 
                isOpen={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                onSave={handleCreateBooking} 
                isSubmitting={isActionLoading}
            />

            {/* Edit Dialog */}
            <BookingFormDialog 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                onSave={handleUpdateBooking} 
                isSubmitting={isActionLoading}
                booking={selectedBooking}
            />

            <Drawer open={isMobile && !!selectedBookingId} onOpenChange={(open) => !open && handleCloseDetails()}>
                <DrawerContent className="max-h-[92dvh] flex flex-col">
                    <DrawerHeader className="border-b shrink-0 px-6 py-4">
                        <DrawerTitle className="text-left font-black uppercase tracking-tight">Intake Profile</DrawerTitle>
                        <DrawerDescription className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Detailed overview of service technical requirements.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {selectedBooking && (
                            <div className="p-4">
                                <BookingDetails 
                                    booking={selectedBooking}
                                    onClose={handleCloseDetails}
                                    onStatusChange={handleStatusChange}
                                    onConvertToJobCard={handleConvertToJobCard}
                                    onEdit={() => setIsEditOpen(true)}
                                />
                            </div>
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default BookingsPage;
