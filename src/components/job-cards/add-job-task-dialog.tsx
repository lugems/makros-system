'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Clock, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function AddJobTaskDialog({ jobCardId }: { jobCardId: string }) {
  const db = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');

  const handleSubmit = async () => {
    if (!taskDescription) return;

    const taskRef = doc(collection(db, 'jobCards', jobCardId, 'tasks'));
    const payload = {
        jobCardId,
        taskDescription,
        estimatedHours: parseFloat(estimatedHours),
        status: 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    setDoc(taskRef, payload).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: taskRef.path,
            operation: 'create',
            requestResourceData: payload,
        }));
    });

    setOpen(false);
    setTaskDescription('');
    setEstimatedHours('1');
    toast({ title: "Task Enrolled", description: "Repair roadmap updated successfully." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all shadow-sm"
        >
          <Plus className="h-3 w-3 mr-1.5" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden p-0 sm:max-w-[480px] border-border/50">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Specify Technical Task</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6 px-6 pb-6 pt-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-3 w-3 text-primary" /> Task Description
              </Label>
              <Input 
                placeholder="e.g. Front brake pad replacement" 
                value={taskDescription} 
                onChange={e => setTaskDescription(e.target.value)} 
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
                value={estimatedHours} 
                onChange={e => setEstimatedHours(e.target.value)} 
                className="rounded-xl h-11 bg-muted/50 border-none font-black text-primary"
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="p-6 border-t">
          <Button 
            className="w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]" 
            onClick={handleSubmit}
            disabled={!taskDescription}
          >
              Register Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
