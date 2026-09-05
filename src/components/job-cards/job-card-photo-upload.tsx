'use client';

import React, { useState, useEffect } from 'react';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { uploadJobCardPhoto, deleteFile } from '@/lib/storage-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Camera, Trash2, Loader2, Eye, Plus, FileImage, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface JobCardPhotoUploadProps {
  jobCardId: string;
}

/**
 * @fileOverview Technical imagery terminal for repair dossiers. 
 * Supports Proof-of-Repair documentation through secure Storage integration.
 */
export function JobCardPhotoUpload({ jobCardId }: JobCardPhotoUploadProps) {
  const { toast } = useToast();
  const { role } = useAuth();
  const [photos, setPhotos] = useState<{ url: string; path: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const canUpload = Boolean(role && ['Makros System Owner', 'Workshop Manager', 'Mechanic'].includes(role));

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const folderRef = ref(storage, `job-card-photos/${jobCardId}`);
      const res = await listAll(folderRef);
      const photoPromises = res.items.map(async (item) => ({
        url: await getDownloadURL(item),
        path: item.fullPath,
      }));
      const resolvedPhotos = await Promise.all(photoPromises);
      setPhotos(resolvedPhotos);
    } catch (error: any) {
      console.error('Failed to load technical imagery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [jobCardId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadJobCardPhoto(jobCardId, file);
      toast({ title: "Imagery Registered", description: "Technical photo added to the operation dossier." });
      await loadPhotos();
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Upload Failed", 
        description: "Insufficient clearance or transmission error." 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    try {
      await deleteFile(path);
      toast({ title: "Evidence Purged", description: "Technical imagery removed from registry." });
      await loadPhotos();
    } catch (error) {
      toast({ variant: "destructive", title: "Purge Failed", description: "Administrative authority required to delete evidence." });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
      {canUpload && (
        <div className="relative group aspect-square rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/50 hover:border-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
          <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-105">
            <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Capture Intake</span>
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
                <DialogTitle className="sr-only">Job Card Photo Preview</DialogTitle>
                <DialogDescription className="sr-only">Technical proof-of-repair imagery linked to the active job dossier.</DialogDescription>
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
                  <CheckCircle2 className="h-2 w-2 mr-1 text-green-500" /> Forensic
              </Badge>
          </div>
        </div>
      ))}

      {photos.length === 0 && !isUploading && !isLoading && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30 text-muted-foreground border-2 border-dashed rounded-[3rem] bg-muted/5">
              <FileImage className="h-12 w-12 mb-4" />
              <p className="text-sm font-medium italic">No forensic imagery recorded for this repair dossier.</p>
          </div>
      )}
    </div>
  );
}
