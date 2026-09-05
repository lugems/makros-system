'use client';

import React, { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { uploadVehiclePhoto, deleteFile } from '@/lib/storage-service';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Camera, Trash2, Loader2, Eye, Plus, FileImage, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface VehiclePhotoUploadProps {
  vehicleId: string;
}

export function VehiclePhotoUpload({ vehicleId }: VehiclePhotoUploadProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const [photos, setPhotos] = useState<{ url: string; path: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const canUpload = Boolean(role && ['Makros System Owner', 'Workshop Manager', 'Mechanic', 'Receptionist'].includes(role));

  const loadPhotos = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const folderRef = ref(storage, `vehicle-photos/${vehicleId}`);
      const res = await listAll(folderRef);
      const photoPromises = res.items.map(async (item) => ({
        url: await getDownloadURL(item),
        path: item.fullPath,
      }));
      const resolvedPhotos = await Promise.all(photoPromises);
      setPhotos(resolvedPhotos);
    } catch (error: any) {
      console.error('Failed to load technical imagery:', error);
      if (error.code === 'storage/unauthorized') {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [vehicleId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadVehiclePhoto(vehicleId, file);
      toast({ title: "Evidence Registered", description: "Technical photo has been added to the vehicle record." });
      await loadPhotos();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "Technical clearance or connection error during image transmission." 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await deleteFile(path);
      toast({ title: "Imagery Purged", description: "Record has been updated." });
      await loadPhotos();
    } catch (error) {
      toast({ variant: "destructive", title: "Purge Failed", description: "Insufficient clearance to modify historical evidence." });
    }
  };

  if (hasError) {
    return (
        <div className="col-span-full py-12 flex flex-col items-center justify-center text-destructive border-2 border-dashed rounded-[2rem] bg-destructive/5 border-destructive/20">
            <ShieldAlert className="h-10 w-10 mb-2" />
            <p className="text-sm font-black uppercase tracking-widest">Access Restricted</p>
            <p className="text-xs font-medium italic max-w-xs text-center leading-relaxed">
                Personnel registry UID mismatch detected. Ensure Firestore document ID matches Auth UID for administrative clearance.
            </p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {canUpload && (
        <div className="relative group aspect-square rounded-2xl bg-muted/30 border-2 border-dashed border-border/50 hover:border-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Plus className="h-8 w-8" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Register Photo</span>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          />
        </div>
      )}

      {photos.map((photo, idx) => (
        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-muted border border-border/50 shadow-sm">
          <Image 
            src={photo.url} 
            alt={`Technical record ${idx}`} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                  <Eye className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 border-none bg-transparent">
                <DialogTitle className="sr-only">Vehicle Photo Preview</DialogTitle>
                <DialogDescription className="sr-only">High-fidelity forensic imagery for vehicle identification and audit.</DialogDescription>
                <div className="relative w-full aspect-video">
                  <Image src={photo.url} alt="Registry Detail" fill className="object-contain" />
                </div>
              </DialogContent>
            </Dialog>
            {canUpload && (
                <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDelete(photo.path)}
                    className="h-10 w-10 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-500"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            )}
          </div>
        </div>
      ))}

      {photos.length === 0 && !isUploading && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30 text-muted-foreground border-2 border-dashed rounded-[2rem] bg-muted/5">
              <FileImage className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium italic">No forensic imagery recorded for this asset.</p>
          </div>
      )}
    </div>
  );
}
