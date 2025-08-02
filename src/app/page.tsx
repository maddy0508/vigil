
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
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SystemVectors } from "@/components/dashboard/system-vectors";
import { useState, useEffect } from "react";
import { threatReasoning, ThreatReasoningOutput } from "@/ai/flows/threat-reasoning";
import { useToast } from "@/hooks/use-toast";


// Extend the Window interface to include our electronAPI
declare global {
  interface Window {
    electronAPI: {
      getSystemProcesses: () => Promise<string>;
      getNetworkConnections: () => Promise<string>;
      getDiscoveredServices: () => Promise<string>;
      getSystemLogs: () => Promise<string>;
    };
  }
}

export default function DashboardPage() {
  const userName = "Alex";

  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { toast } = useToast();

  const runSystemCheck = async () => {
    if (typeof window === 'undefined' || !window.electronAPI) {
      console.log("Not in Electron environment, skipping system check.");
      // Add mock data for browser-based development
      const mockIncident: Incident = {
          time: new Date().toISOString(),
          title: "System Scan (Simulated)",
          description: "This is a simulated scan running in a browser.",
          details: `Scan complete. No threats found in simulation.`,
          isMalicious: false,
      };
      // setIncidents(prev => [mockIncident, ...prev].slice(0, 20));
      return;
    }
    
    try {
      console.log("Running system check...");
      const [processes, network, services, logs] = await Promise.all([
        window.electronAPI.getSystemProcesses(),
        window.electronAPI.getNetworkConnections(),
        window.electronAPI.getDiscoveredServices(),
        window.electronAPI.getSystemLogs(),
      ]);

      const result: ThreatReasoningOutput = await threatReasoning({
        systemProcesses: processes,
        networkConnections: network,
        discoveredServices: services,
        logs: logs,
        binaries: "No binaries scanned in this scan." // Placeholder
      });

      const newIncident: Incident = {
          time: new Date().toISOString(),
          title: result.isMalicious ? "Threat Neutralized" : "System Scan Completed",
          description: result.reasoning.substring(0, 100) + (result.reasoning.length > 100 ? '...' : ''),
          details: result.isMalicious ? `Response: ${result.actionsTaken}` : 'Scan complete. No threats found.',
          isMalicious: result.isMalicious,
          attackerSummary: result.attackerProfile?.summary,
      };

      setIncidents(prev => [newIncident, ...prev].slice(0, 20));

      if (result.isMalicious) {
          const newThreat: Threat = {
              id: `threat-${Date.now()}`,
              description: result.reasoning,
              severity: "High", // Simplified for now
              status: 'Neutralized',
              timestamp: new Date().toLocaleTimeString(),
          };
          setThreats(prev => [newThreat, ...prev].slice(0, 20));
          toast({
              variant: "destructive",
              title: "Threat Detected & Action Taken",
              description: result.actionsTaken,
          });
      }

    } catch (error) {
      console.error("Error during system check:", error);
       toast({
        variant: "destructive",
        title: "Scan Failed",
        description: "Could not perform the system scan.",
      });
    }
  };

  useEffect(() => {
    // Run an initial check on load
    runSystemCheck();
    // Then run a check every 30 seconds
    const intervalId = setInterval(runSystemCheck, 30000); 

    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 z-10">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold md:text-base text-primary">
            <VigilLogo className="h-7 w-7" />
            <span className="font-headline text-foreground text-xl">Vigil</span>
          </a>
          <a href="#" className="font-bold text-foreground transition-colors hover:text-foreground/80">Dashboard</a>
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
             <SheetHeader>
                <SheetTitle className="sr-only">Vigil Navigation</SheetTitle>
             </SheetHeader>
            <nav className="grid gap-6 text-lg font-medium">
              <a href="#" className="flex items-center gap-2 text-lg font-semibold text-primary">
                <VigilLogo className="h-7 w-7" />
                <span className="font-headline text-foreground text-xl">Vigil</span>
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
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-secondary"
              />
            </div>
          </form>
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person face" />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 xl:grid-cols-3">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:col-span-3">
            <OverviewCards threats={threats} incidents={incidents} />
          </div>
          <Card className="xl:col-span-2 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-headline text-2xl">Incident Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentTimeline incidents={incidents} />
            </CardContent>
          </Card>
          <div className="grid gap-4 xl:grid-rows-2">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">System Vectors</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemVectors />
              </CardContent>
            </Card>
            <Card className="row-span-1 shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <AiChatbot userName={userName} />
              </CardContent>
            </Card>
          </div>
        </div>
        <Tabs defaultValue="threats">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex bg-secondary">
            <TabsTrigger value="threats">Active Threats</TabsTrigger>
            <TabsTrigger value="policies">Policy Adaptation</TabsTrigger>
            <TabsTrigger value="reports">Report Generation</TabsTrigger>
          </TabsList>
          <TabsContent value="threats">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Active Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <ThreatsTable threats={threats} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="policies">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Policy Adaptation Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <PolicyAdaptation />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Generate Forensic Report</CardTitle>
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
