'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Clock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateJobTask } from '@/services/job-cards-service';
import { useAuth } from '@/contexts/auth-context';
import { JobTask } from '@/types/job-card';

interface EditJobTaskDialogProps {
    jobCardId: string;
    task: JobTask;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditJobTaskDialog({ jobCardId, task, isOpen, onOpenChange }: EditJobTaskDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [description, setDescription] = useState(task.taskDescription);
  const [hours, setHours] = useState(task.estimatedHours.toString());

  useEffect(() => {
    if (isOpen) {
        setDescription(task.taskDescription);
        setHours(task.estimatedHours.toString());
    }
  }, [isOpen, task]);

  const handleSubmit = async () => {
    if (!description || !user) return;

    try {
        await updateJobTask(jobCardId, (task as any).id || task.jobTaskId, {
            taskDescription: description,
            estimatedHours: parseFloat(hours),
        }, user.userId);
        
        onOpenChange(false);
        toast({ title: "Task Synchronized", description: "Technical roadmap updated successfully." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Recalibrate Task</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-3 w-3 text-primary" /> Task Description
              </Label>
              <Input 
                placeholder="e.g. Front brake pad replacement" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="rounded-xl h-11 bg-muted/50 border-none font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3 text-primary" /> Estimated Cycle Time (Hours)
              </Label>
              <Input 
                type="number" 
                step="0.5" 
                value={hours} 
                onChange={e => setHours(e.target.value)} 
                className="rounded-xl h-11 bg-muted/50 border-none font-black text-primary"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 border-t">
          <Button 
            className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" 
            onClick={handleSubmit}
            disabled={!description}
          >
              <Save className="h-4 w-4 mr-2" /> Commit Task Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}