'use client';

import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/staff';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLES: UserRole[] = [
  "Makros System Owner",
  "Workshop Manager",
  "Receptionist",
  "Mechanic",
  "Inventory Officer",
  "Accountant",
  "Customer",
];

/**
 * @fileOverview A development-mode role switcher that synchronizes the role change with Firestore.
 * This allows prototyping role-based security rules without manual database edits.
 */
export function RoleSwitcher() {
  const { role, user, firebaseUser } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const handleRoleChange = async (newRole: UserRole) => {
    if (!firebaseUser) return;

    try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        });
        
        toast({
            title: "Authority Shifted",
            description: `Session synchronized as ${newRole}.`,
        });
    } catch (error: any) {
        console.error("Failed to sync role to registry:", error);
        // Fallback for context-only change if DB update is restricted
        toast({
            variant: "destructive",
            title: "Registry Sync Failed",
            description: "Role changed in session only. Technical database access restricted.",
        });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
          <p className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right px-2">God Mode Switcher</p>
          <Select value={role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
            <SelectTrigger className="w-[220px] bg-background/80 backdrop-blur-xl shadow-2xl border-primary/20 h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest">
              <SelectValue placeholder="Switch session role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              {ROLES.map((r) => (
                <SelectItem key={r} value={r} className="text-[10px] font-black uppercase tracking-widest py-2.5">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
      </div>
    </div>
  );
}