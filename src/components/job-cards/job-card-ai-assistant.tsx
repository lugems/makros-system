"use client"

import { useState } from "react"
import { mechanicAidJobCardCreation, MechanicAidJobCardCreationOutput } from "@/ai/flows/mechanic-aid-job-card-creation-flow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, CheckCircle2, Wrench, Package, Banknote } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { CurrencyFormat } from "@/components/shared/currency-format"

export function JobCardAiAssistant() {
  const [loading, setLoading] = useState(false)
  const [issue, setIssue] = useState("")
  const [vehicle, setVehicle] = useState({ make: "", model: "", year: 2020 })
  const [suggestions, setSuggestions] = useState<MechanicAidJobCardCreationOutput | null>(null)

  const handleSuggest = async () => {
    if (!issue || !vehicle.make || !vehicle.model) {
      toast({
        title: "Missing Info",
        description: "Please provide vehicle details and reported issue.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await mechanicAidJobCardCreation({
        reportedIssue: issue,
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year
      })
      // Adjust AI cost from USD to UGX for demonstration (approx 3700 rate)
      const adjustedResult = {
        ...result,
        estimatedLaborCost: result.estimatedLaborCost * 3700
      };
      setSuggestions(adjustedResult)
    } catch {
      toast({
        title: "AI Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-border bg-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Diagnostic Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Make</label>
              <Input 
                placeholder="Toyota" 
                value={vehicle.make}
                onChange={e => setVehicle({...vehicle, make: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <Input 
                placeholder="Camry" 
                value={vehicle.model}
                onChange={e => setVehicle({...vehicle, model: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Year</label>
              <Input 
                type="number" 
                placeholder="2020" 
                value={vehicle.year}
                onChange={e => setVehicle({...vehicle, year: parseInt(e.target.value) || 2020})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Reported Issue</label>
            <Textarea 
              placeholder="e.g. Grinding noise when braking and vibrating steering wheel at high speeds..." 
              rows={4}
              value={issue}
              onChange={e => setIssue(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-primary text-primary-foreground" 
            disabled={loading}
            onClick={handleSuggest}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Repair Suggestions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {suggestions ? (
          <>
            <Card className="border-border bg-secondary/5 border-l-4 border-l-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent" />
                  Suggested Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {suggestions.suggestedTasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {task}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-secondary/5 border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Required Parts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.requiredParts.map((part, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-background border text-sm">
                      <span className="truncate">{part.name}</span>
                      <span className="font-bold text-accent">x{part.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-accent/10 border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-accent uppercase tracking-wider">Estimated Labor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black flex items-center gap-2">
                  <Banknote className="w-6 h-6" />
                  <CurrencyFormat value={suggestions.estimatedLaborCost} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">AI-calculated based on typical repair duration for this model.</p>
              </CardContent>
            </Card>
            
            <Button className="w-full bg-accent text-accent-foreground font-bold hover:bg-accent/90">
              Create Job Card from Suggestions
            </Button>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center bg-secondary/5">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">AI Suggestions Pending</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Fill in the vehicle details and reported issue to let our AI assistant suggest the repair path.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
