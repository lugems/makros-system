'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkshopSettings } from '@/types/settings';
import { User, Phone, Mail, MapPin, Building2, Camera, Trash2, Loader2, Image as ImageIcon, Plus, X, Globe, FileText } from 'lucide-react';
import { uploadWorkshopLogo } from '@/lib/storage-service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface WorkshopProfileSettingsProps {
  data: Partial<WorkshopSettings> | null;
  onUpdate: (field: keyof WorkshopSettings, value: any) => void;
}

/**
 * @fileOverview Technical Calibration terminal for Workshop Corporate Identity.
 * Includes Branding (Logo), Legal registration, and multi-channel communication parameters.
 */
export function WorkshopProfileSettings({ data, onUpdate }: WorkshopProfileSettingsProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const downloadUrl = await uploadWorkshopLogo(file);
      onUpdate('logoUrl', downloadUrl);
      toast({ title: "Branding Synchronized", description: "Workshop logo has been updated in the master registry." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Transmission Error", 
        description: error.message || "Failed to synchronize branding assets." 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeLogo = () => {
    onUpdate('logoUrl', '');
    toast({ title: "Branding Revoked", description: "Workshop logo removed from registry buffer." });
  };

  // Dynamic Multi-Field Logic
  const handleAddItem = (field: 'additionalPhones' | 'additionalEmails') => {
    const currentItems = data?.[field] || [];
    onUpdate(field, [...currentItems, '']);
  };

  const handleRemoveItem = (field: 'additionalPhones' | 'additionalEmails', index: number) => {
    const currentItems = data?.[field] || [];
    const newItems = currentItems.filter((_, i) => i !== index);
    onUpdate(field, newItems);
  };

  const handleUpdateItem = (field: 'additionalPhones' | 'additionalEmails', index: number, value: string) => {
    const currentItems = data?.[field] || [];
    const newItems = [...currentItems];
    newItems[index] = value;
    onUpdate(field, newItems);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Corporate Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Logo Calibration Terminal */}
            <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workshop Branding (Logo)</Label>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-[1.5rem] bg-muted/50 border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/40 group-hover:bg-primary/5">
                            {data?.logoUrl ? (
                                <Image 
                                    src={data.logoUrl} 
                                    alt="Workshop Logo" 
                                    fill 
                                    className="object-contain p-2" 
                                />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                            )}
                            
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-110"
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                </button>
                                {data?.logoUrl && (
                                    <button 
                                        type="button"
                                        onClick={removeLogo}
                                        className="h-9 w-9 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-500 flex items-center justify-center transition-transform hover:scale-110"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase opacity-70">
                            Upload a high-resolution logo for certified documents and portal branding. Preferred format: PNG/SVG (max 5MB).
                        </p>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-[9px] font-black uppercase tracking-widest bg-background border-border/50 rounded-lg"
                        >
                            Select Image
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workshop Name</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={data?.workshopName || ''} 
                  onChange={(e) => onUpdate('workshopName', e.target.value)}
                  placeholder="e.g. Makros System Workshop"
                  className="pl-11 h-12 bg-muted/20 border-border/50 rounded-xl font-bold focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Registration Name</Label>
                    <Input 
                        value={data?.businessRegistrationName || ''} 
                        onChange={(e) => onUpdate('businessRegistrationName', e.target.value)}
                        placeholder="e.g. Makros Auto Services Ltd"
                        className="h-12 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary/20"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                        <FileText className="h-3 w-3" /> TIN / Registration ID
                    </Label>
                    <Input 
                        value={data?.tin || ''} 
                        onChange={(e) => onUpdate('tin', e.target.value)}
                        placeholder="Tax Identification Number"
                        className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold font-mono text-xs uppercase"
                    />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border/50 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Communication Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Phones Sub-section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telephony Network</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAddItem('additionalPhones')}
                    className="h-7 text-[8px] font-black uppercase tracking-widest gap-1.5 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="h-3 w-3" /> Add Line
                  </Button>
              </div>
              <div className="space-y-3">
                  <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                          value={data?.phone || ''} 
                          onChange={(e) => onUpdate('phone', e.target.value)}
                          placeholder="Primary contact..."
                          className="pl-11 h-12 bg-muted/20 border-border/50 rounded-xl font-bold focus-visible:ring-primary/20"
                      />
                  </div>
                  {data?.additionalPhones?.map((p, idx) => (
                      <div key={`phone-${idx}`} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <div className="relative flex-1">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                              <Input 
                                  value={p} 
                                  onChange={(e) => handleUpdateItem('additionalPhones', idx, e.target.value)}
                                  placeholder={`Additional line ${idx + 1}...`}
                                  className="pl-11 h-12 bg-muted/10 border-border/50 rounded-xl font-bold"
                              />
                          </div>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem('additionalPhones', idx)}
                              className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  ))}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Emails Sub-section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Electronic Mail Directory</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAddItem('additionalEmails')}
                    className="h-7 text-[8px] font-black uppercase tracking-widest gap-1.5 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="h-3 w-3" /> Add Address
                  </Button>
              </div>
              <div className="space-y-3">
                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                      <Input 
                          value={data?.email || ''} 
                          onChange={(e) => onUpdate('email', e.target.value)}
                          placeholder="Primary registry email..."
                          className="pl-11 h-12 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary/20"
                      />
                  </div>
                  {data?.additionalEmails?.map((e, idx) => (
                      <div key={`email-${idx}`} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <div className="relative flex-1">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                              <Input 
                                  value={e} 
                                  onChange={(e) => handleUpdateItem('additionalEmails', idx, e.target.value)}
                                  placeholder={`Additional email ${idx + 1}...`}
                                  className="pl-11 h-12 bg-muted/10 border-border/50 rounded-xl font-medium"
                              />
                          </div>
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveItem('additionalEmails', idx)}
                              className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10"
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                  ))}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Website Section */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <Globe className="h-3 w-3" /> Digital Headquarters (Website)
              </Label>
              <Input 
                value={data?.website || ''} 
                onChange={(e) => onUpdate('website', e.target.value)}
                placeholder="https://www.makrossystem.ug"
                className="h-12 bg-muted/20 border-border/50 rounded-xl font-medium focus-visible:ring-primary/20"
              />
            </div>

            <Separator className="opacity-50" />

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Distribution Center</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
                <textarea 
                  value={data?.address || ''} 
                  onChange={(e) => onUpdate('address', e.target.value)}
                  className="w-full min-h-[100px] pl-11 pt-3 bg-muted/20 border border-border/50 rounded-xl font-medium focus-visible:ring-primary/20 outline-none text-sm resize-none"
                  placeholder="Street Address, City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
