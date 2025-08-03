
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { suggestionEngine, SuggestionEngineOutput } from "@/ai/flows/policy-adaptation-manager";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Loader2 } from "lucide-react";

export function PolicyAdaptation() {
  const [suggestions, setSuggestions] = useState<SuggestionEngineOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    setSuggestions(null);
    try {
      // In a real app, you'd pull this from a database of recent events.
      const recentIncidentsSummary = "Recent incidents involved the 'ShadowNet' threat actor using compromised system processes to exfiltrate data via unusual ports. The response was effective but took 5 minutes to fully deploy the firewall rule.";
      const currentCapabilities = "Current capabilities include: Port scanning (nmap), DNS lookups (dig, whois, nslookup), process monitoring, IP blocking, and program uninstallation.";

      const result = await suggestionEngine({
        recentIncidents: recentIncidentsSummary,
        currentCapabilities: currentCapabilities,
      });

      setSuggestions(result.suggestions);
      toast({
        title: "Suggestions Generated",
        description: "The AI has analyzed recent performance and provided improvement suggestions."
      });

    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate suggestions. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Vigil's meta-learning AI analyzes its own performance to suggest improvements. Click below to generate new strategic recommendations based on the latest system activity.
        </p>
        <Button onClick={handleGenerateSuggestions} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Analyzing Performance..." : "Generate Improvement Suggestions"}
        </Button>
      </div>

      {suggestions && (
        <div className="space-y-4">
            {suggestions.map((item, index) => (
                 <div key={index} className="p-4 rounded-lg border bg-card-foreground/5">
                    <h4 className="font-semibold flex items-center gap-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{item.category}</span>
                        {item.suggestion}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-border ml-2">
                        <span className="font-semibold text-foreground">Justification:</span> {item.justification}
                    </p>
                </div>
            ))}
             <div className="flex justify-end">
                <Button variant="outline">Acknowledge Suggestions</Button>
            </div>
        </div>
      )}
    </div>
  )
}
