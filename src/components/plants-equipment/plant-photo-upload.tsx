'use client';

import React, { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { uploadPlantPhoto, deleteFile } from '@/lib/storage-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Camera, Trash2, Loader2, Eye, Plus, FileImage, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PlantPhotoUploadProps {
  assetId: string;
}

/**
 * @fileOverview Technical imagery terminal for industrial machinery.
 * Provides forensic proof-of-repair and condition documentation.
 */
export function PlantPhotoUpload({ assetId }: PlantPhotoUploadProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const [photos, setPhotos] = useState<{ url: string; path: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const canUpload = ['Makros System Owner', 'Workshop Manager', 'Mechanic', 'Inventory Officer'].includes(role || '');

  const loadPhotos = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const folderRef = ref(storage, `plant-photos/${assetId}`);
      const res = await listAll(folderRef);
      const photoPromises = res.items.map(async (item) => ({
        url: await getDownloadURL(item),
        path: item.fullPath,
      }));
      const resolvedPhotos = await Promise.all(photoPromises);
      setPhotos(resolvedPhotos);
    } catch (error: any) {
      console.error('Failed to load industrial imagery:', error);
      if (error.code === 'storage/unauthorized') {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [assetId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadPlantPhoto(assetId, file);
      toast({ title: "Evidence Registered", description: "Technical photo added to the asset dossier." });
      await loadPhotos();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "Registry synchronization or authorization error during image transmission." 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await deleteFile(path);
      toast({ title: "Imagery Purged", description: "Technical record has been updated." });
      await loadPhotos();
    } catch (error) {
      toast({ variant: "destructive", title: "Purge Failed", description: "Administrative authority required to decommission evidence." });
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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {canUpload && (
        <div className="relative group aspect-square rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/50 hover:border-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
          <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-105 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Capture Asset State</span>
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
        <div key={idx} className="relative group aspect-square rounded-[2rem] overflow-hidden bg-muted border border-border/50 shadow-md">
          <Image 
            src={photo.url} 
            alt={`Technical evidence ${idx}`} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110">
                  <Eye className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
                <DialogTitle className="sr-only">Asset Photo Preview</DialogTitle>
                <DialogDescription className="sr-only">High-fidelity forensic imagery for technical machinery identification.</DialogDescription>
                <div className="relative w-full aspect-video">
                  <Image src={photo.url} alt="Forensic Detail" fill className="object-contain" />
                </div>
              </DialogContent>
            </Dialog>
            {canUpload && (
                <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => handleDelete(photo.path)}
                    className="h-11 w-11 rounded-2xl bg-red-500/20 hover:bg-red-500/40 text-red-500 transition-all hover:scale-110"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            )}
          </div>
          <div className="absolute top-3 left-3">
              <Badge className="bg-background/80 backdrop-blur-md text-[8px] font-black uppercase text-foreground border-none">
                  <CheckCircle2 className="h-2 w-2 mr-1 text-green-500" /> Forensic Sync
              </Badge>
          </div>
        </div>
      ))}

      {photos.length === 0 && !isUploading && !isLoading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30 text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/5">
              <FileImage className="h-12 w-12 mb-4" />
              <p className="text-sm font-medium italic">No technical imagery registered for this asset.</p>
          </div>
      )}
    </div>
  );
}
