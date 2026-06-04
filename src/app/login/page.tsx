'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Fingerprint, LogIn, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview The primary entry point for authorized personnel and registered clients.
 * Handles credential verification and role-based redirection to the appropriate command center or portal.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginImageData = PlaceHolderImages.find(img => img.id === 'login-bg');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
    } catch (error: any) {
      // Surface the Firebase error to the user
      toast({
        variant: "destructive",
        title: "Terminal Access Denied",
        description: error.code === 'auth/invalid-credential' 
          ? "The provided identification or access token is incorrect." 
          : error.message || "An unexpected error occurred during synchronization.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Visual Identity Section (Left) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {loginImageData && (
          <Image
            src={loginImageData.imageUrl}
            alt={loginImageData.description}
            fill
            className="object-cover opacity-40 mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-700"
            data-ai-hint={loginImageData.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl">
                <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Makros System</h1>
          </div>

          <div className="max-w-md space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">v2.4.0 Engine Active</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase font-headline leading-none">
              Workshop <br /> <span className="text-primary">Intelligence</span> System.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Orchestrate technical staff, inventory logistics, and revenue performance from a single forensic-grade command center.
            </p>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Secure Registry</div>
            <div className="flex items-center gap-2"><Fingerprint className="h-4 w-4" /> Biometric Ready</div>
          </div>
        </div>
      </div>

      {/* Terminal Access Section (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <Card className="w-full max-w-[440px] border-none shadow-none bg-transparent">
          <CardHeader className="space-y-1 pb-8">
            <div className="lg:hidden flex items-center justify-center mb-8">
               <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <ShieldCheck className="text-white w-7 h-7" />
                </div>
            </div>
            <CardTitle className="text-3xl font-black uppercase tracking-tight font-headline">Terminal Access</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Initialize authorized credentials to sync with the workshop ledger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Fingerprint className="h-3.5 w-3.5" /> Electronic Identification
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@domain.ug" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Token</Label>
                    <Button variant="link" className="text-[10px] font-black uppercase tracking-widest h-auto p-0 opacity-40 hover:opacity-100">Reset Token</Button>
                  </div>
                  <div className="relative">
                    <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-mono tracking-widest pr-10"
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
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 gap-3 text-[11px] transition-all hover:scale-[1.01]"
                disabled={isLoading}
              >
                {isLoading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                    <>
                        Initialize Command <LogIn className="h-4 w-4" />
                    </>
                )}
              </Button>
            </form>
            
            <div className="mt-12 pt-8 border-t border-dashed border-border/50">
              <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-dashed border-border/50">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                  Notice: Authorized personnel and client records detected. Ensure token matches terminal registry.
                </p>
              </div>
              <p className="text-[9px] font-black text-center text-muted-foreground/40 uppercase tracking-[0.4em] leading-relaxed mt-6">
                Makros System Professional Workshop OS • Secure Entry Point
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
