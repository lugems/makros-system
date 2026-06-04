'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    ShieldCheck, 
    Fingerprint, 
    Calendar,
    Lock,
    Key,
    Activity,
    Pencil,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FormattedDate } from '@/components/shared/formatted-date';
import { uploadStaffPhoto } from '@/lib/storage-service';
import { updateStaffRecord } from '@/services/users-service';
import { useToast } from '@/hooks/use-toast';
import { updatePassword } from 'firebase/auth';
import type { Customer } from '@/types/customer';

/**
 * @fileOverview Client Profile Dossier for the Customer Portal.
 * Displays forensic account details and allows for profile imagery and credential synchronization.
 * Synchronizes with the 'customers' collection for high-fidelity CRM data like physical location.
 */
export default function CustomerProfilePage() {
    const { user, firebaseUser } = useAuth();
    const { toast } = useToast();
    const db = useFirestore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Technical Data Stream: Explicitly fetch the detailed CRM record from the 'customers' collection
    const customerRef = useMemoFirebase(() => {
        if (!db || !user?.userId) return null;
        return doc(db, 'customers', user.userId) as DocumentReference<Customer>;
    }, [db, user?.userId]);
    
    const { data: customerData, loading: customerLoading } = useDoc<Customer>(customerRef);

    // State for Profile Sync
    const [isUploading, setIsUploading] = useState(false);

    // State for Credential Sync
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const downloadUrl = await uploadStaffPhoto(user.userId, file);
            await updateStaffRecord(user.userId, { photoUrl: downloadUrl }, user.userId);
            toast({ title: "Profile Synchronized", description: "Your identification imagery has been updated." });
        } catch (error: any) {
            toast({ 
                variant: "destructive", 
                title: "Update Failed", 
                description: error.message || "Failed to synchronize profile imagery." 
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebaseUser) return;

        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "The provided access tokens do not match.",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Security Violation",
                description: "Access token must be at least 6 characters in length.",
            });
            return;
        }

        setIsPasswordLoading(true);
        try {
            await updatePassword(firebaseUser, newPassword);
            toast({
                title: "Credentials Synchronized",
                description: "Your master access token has been updated successfully.",
            });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                toast({
                    variant: "destructive",
                    title: "Session Matured",
                    description: "For security, this action requires a fresh login session. Please re-authenticate.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Sync Failed",
                    description: error.message || "An unexpected error occurred during credential update.",
                });
            }
        } finally {
            setIsPasswordLoading(false);
        }
    };

    if (!user) return null;

    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-headline">My Profile</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] opacity-60">Certified Client Dossier</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Primary Identification */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card overflow-hidden shadow-sm premium-shadow">
                        <CardHeader className="bg-muted/30 p-10 border-b flex flex-col items-center text-center space-y-4">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 ring-4 ring-primary/5 shadow-2xl transition-all group-hover:opacity-90">
                                    <AvatarImage src={user.photoUrl || `https://picsum.photos/seed/${user.userId}/200/200`} />
                                    <AvatarFallback className="font-black text-3xl bg-primary text-white">
                                        {user.fullName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                                >
                                    {isUploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Pencil className="h-6 w-6 text-white" />}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-none text-foreground">{user.fullName}</h2>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Authorized Client</p>
                            </div>
                            <Badge variant="success" className="h-8 text-[9px] font-black uppercase px-4 shadow-sm border-none">Verified Active</Badge>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-1 text-center">
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">Technical Authority</p>
                                <div className="flex items-center justify-center gap-2 bg-muted/50 py-2 rounded-xl">
                                    <Fingerprint className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-mono font-bold uppercase">{user.userId.toUpperCase().slice(-12)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                            <Lock className="h-4 w-4" /> Security protocol
                        </h4>
                        <p className="text-[11px] font-medium leading-relaxed italic text-white/70 relative z-10">
                            Your account is protected by industry-standard encryption. Ensure your access tokens are stored securely to prevent unauthorized workshop actions.
                        </p>
                    </div>
                </div>

                {/* Detailed Parameters & Security */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" /> Registry Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 space-y-10">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Address</label>
                                        <p className="text-base font-bold flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-primary/60" /> {customerData?.email || user.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Authority</label>
                                        <p className="text-base font-bold flex items-center gap-3">
                                            <Phone className="h-4 w-4 text-primary/60" /> {customerData?.phone || user.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Physical Location</label>
                                        {customerLoading ? (
                                            <div className="h-6 w-48 bg-muted animate-pulse rounded-lg mt-2" />
                                        ) : (
                                            <p className="text-base font-medium flex items-start gap-3 italic leading-relaxed">
                                                <MapPin className="h-4 w-4 text-primary/60 shrink-0 mt-1" /> {customerData?.address || user.address || 'Address record pending sync.'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enrollment Date</label>
                                        <p className="text-base font-bold flex items-center gap-3 text-foreground">
                                            <Calendar className="h-4 w-4 text-indigo-500/60" /> 
                                            <FormattedDate date={customerData?.createdAt || user.createdAt} formatString="dd MMMM yyyy" />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-50" />

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-3.5 w-3.5" /> Portal access metadata
                                </h4>
                                <div className="bg-muted/10 p-6 rounded-3xl border border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center">
                                            <Activity className="h-5 w-5 text-primary opacity-50" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Last Synchronization</p>
                                            <p className="text-sm font-bold uppercase text-foreground">
                                                <FormattedDate date={customerData?.updatedAt || user.updatedAt} />
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="h-10 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest bg-background border-border/50">
                                        Metadata Sync
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Access Management */}
                    <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="bg-muted/30 border-b p-8">
                            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Key className="h-4 w-4 text-primary" /> Security & Access Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handlePasswordChange} className="space-y-8 max-w-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                                            New Access Token
                                        </Label>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-12 bg-muted/30 border-border/50 rounded-xl font-bold pr-11"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                                            Verify Token
                                        </Label>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={cn(
                                                    "h-12 bg-muted/30 border-border/50 rounded-xl font-bold pr-11",
                                                    confirmPassword && !passwordsMatch && "border-destructive/50"
                                                )}
                                                placeholder="••••••••"
                                                required
                                            />
                                            {passwordsMatch && (
                                                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                            <AlertCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Protocol Notice</p>
                                            <p className="text-[11px] font-medium leading-relaxed italic text-muted-foreground">
                                                Tokens must be at least 6 characters. Updates require a verified session.
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={isPasswordLoading || !passwordsMatch || newPassword.length < 6}
                                        className="w-full sm:w-auto h-12 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20"
                                    >
                                        {isPasswordLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                                        Update Master Key
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer className="bg-muted/30 px-8 py-6 border-t flex items-center justify-center rounded-[2.5rem]">
                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.6em] text-center">Makros System Client Portal • Authorized Access Certified</p>
            </footer>
        </div>
    );
}
