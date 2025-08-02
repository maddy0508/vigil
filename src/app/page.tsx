"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VigilLogo } from "@/components/vigil-logo";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { IncidentTimeline, type Incident } from "@/components/dashboard/incident-timeline";
import { AiChatbot } from "@/components/dashboard/ai-chatbot";
import { ThreatsTable, type Threat } from "@/components/dashboard/threats-table";
import { PolicyAdaptation } from "@/components/dashboard/policy-adaptation";
import { ReportGeneration } from "@/components/dashboard/report-generation";
import { Search, Menu, Play, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RealtimeThreat } from "@/components/dashboard/realtime-threat";
import { SystemVectors } from "@/components/dashboard/system-vectors";
import { useState, useEffect, useCallback } from "react";
import { threatSimulator } from "@/ai/flows/threat-simulator";
import { threatReasoning, ThreatReasoningOutput } from "@/ai/flows/threat-reasoning";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const userName = "Alex";
  const { toast } = useToast();

  const [isSimulating, setIsSimulating] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const runSimulation = useCallback(async () => {
    try {
      const simulatedEvent = await threatSimulator();
      const analysis: ThreatReasoningOutput = await threatReasoning(simulatedEvent);
      
      const now = new Date();

      if (analysis.isMalicious) {
        const newThreat: Threat = {
          id: `THR-${now.getTime()}`,
          description: analysis.reasoning.split('.')[0], // First sentence as description
          severity: 'High', // Simplified for demo
          status: 'New',
          timestamp: now.toLocaleTimeString(),
        };
        setThreats(prev => [newThreat, ...prev].slice(0, 5));

         const newIncident: Incident = {
          time: now.toISOString(),
          title: "Malicious Activity Detected",
          description: newThreat.description,
          details: analysis.reasoning,
          isMalicious: true,
          attackerSummary: analysis.attackerProfile?.summary,
        };
        setIncidents(prev => [newIncident, ...prev].slice(0, 4));

      } else {
         const newIncident: Incident = {
          time: now.toISOString(),
          title: "System Activity Analyzed",
          description: "Benign activity detected and logged.",
          details: analysis.reasoning,
          isMalicious: false,
        };
        setIncidents(prev => [newIncident, ...prev].slice(0, 4));
      }

    } catch (error) {
      console.error("Simulation failed:", error);
      toast({
        variant: "destructive",
        title: "Simulation Error",
        description: "Could not run the threat simulation."
      })
      setIsSimulating(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isSimulating) {
      runSimulation(); // Run once immediately
      const interval = setInterval(runSimulation, 10000); // Then every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isSimulating, runSimulation]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
            <VigilLogo className="h-7 w-7" />
            <span className="font-headline text-foreground">Vigil</span>
          </a>
          <a href="#" className="font-medium text-foreground transition-colors hover:text-foreground/80">Dashboard</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground/80">Incidents</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground/80">Policies</a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground/80">Reports</a>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <a href="#" className="flex items-center gap-2 text-lg font-semibold text-primary">
                <VigilLogo className="h-7 w-7" />
                <span className="font-headline text-foreground">Vigil</span>
              </a>
              <a href="#" className="text-foreground hover:text-foreground/80">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-foreground/80">Incidents</a>
              <a href="#" className="text-muted-foreground hover:text-foreground/80">Policies</a>
              <a href="#" className="text-muted-foreground hover:text-foreground/80">Reports</a>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search threats, incidents..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
           <Button variant="outline" size="icon" onClick={() => setIsSimulating(!isSimulating)}>
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">{isSimulating ? "Pause Simulation" : "Start Simulation"}</span>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person face" />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 xl:grid-cols-3">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:col-span-3">
            <OverviewCards />
          </div>
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-xl">Incident Timeline</CardTitle>
                <RealtimeThreat />
            </CardHeader>
            <CardContent>
              <IncidentTimeline incidents={incidents} />
            </CardContent>
          </Card>
          <div className="grid gap-4 xl:grid-rows-2">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">System Vectors</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemVectors />
              </CardContent>
            </Card>
            <Card className="row-span-1">
              <CardHeader>
                <CardTitle className="font-headline text-xl">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <AiChatbot userName={userName} />
              </CardContent>
            </Card>
          </div>
        </div>
        <Tabs defaultValue="threats">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="threats">Active Threats</TabsTrigger>
            <TabsTrigger value="policies">Policy Adaptation</TabsTrigger>
            <TabsTrigger value="reports">Report Generation</TabsTrigger>
          </TabsList>
          <TabsContent value="threats">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Active Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <ThreatsTable threats={threats} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="policies">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Policy Adaptation Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <PolicyAdaptation />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Generate Forensic Report</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportGeneration />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
