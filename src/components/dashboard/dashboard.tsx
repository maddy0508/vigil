
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VigilLogo } from "@/components/vigil-logo";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { IncidentTimeline, type Incident } from "@/components/dashboard/incident-timeline";
import { AiChatbot, type Message } from "@/components/dashboard/ai-chatbot";
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
import { threatReasoning, ThreatReasoningInput, ThreatReasoningOutput } from "@/ai/flows/threat-reasoning";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeGraph } from "./knowledge-graph";
import { Share } from "./share";

declare global {
    interface Window {
        electronAPI: {
            getSystemProcesses: () => Promise<string>;
            getNetworkConnections: () => Promise<string>;
            getDiscoveredServices: () => Promise<string>;
            getSystemLogs: () => Promise<string>;
        }
    }
}

export function Dashboard() {
  const userName = "Alex";

  const [threats, setThreats] = useState<Threat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([
     { role: "assistant", content: `Hello ${userName}! How can I help you with your system's security today?` }
  ]);
  const { toast } = useToast();

  const runSystemCheck = async () => {
    console.log("Running real system check with AI...");
    
    if (!window.electronAPI) {
        console.error("Electron API is not available. Cannot run system check.");
        toast({
            variant: "destructive",
            title: "Execution Error",
            description: "This feature is only available in the Electron desktop app.",
        });
        return;
    }

    try {
        const [processes, network, services, logs] = await Promise.all([
            window.electronAPI.getSystemProcesses(),
            window.electronAPI.getNetworkConnections(),
            window.electronAPI.getDiscoveredServices(),
            window.electronAPI.getSystemLogs(),
        ]);

        const systemInput: ThreatReasoningInput = {
            systemProcesses: processes,
            networkConnections: network,
            discoveredServices: services,
            logs: logs,
            binaries: "N/A for this scan", 
        };

      const result: ThreatReasoningOutput = await threatReasoning(systemInput);

      if (result.isMalicious) {
         const newIncident: Incident = {
            time: new Date().toISOString(),
            title: "AI-Detected Anomaly",
            description: result.reasoning.substring(0, 100) + '...',
            details: `Recommended Action: ${result.recommendedActions}`,
            isMalicious: true,
            attackerSummary: result.attackerProfile?.summary,
        };
        setIncidents(prev => [newIncident, ...prev].slice(0, 20));

        const newThreat: Threat = {
            id: `threat-${Date.now()}`,
            description: result.reasoning,
            severity: "High",
            status: 'Action Recommended',
            timestamp: new Date().toLocaleTimeString(),
        };
        setThreats(prev => [newThreat, ...prev].slice(0, 20));

        // Proactively start a conversation with the user in the chat
        const aiQueryMessage: Message = {
            role: "assistant",
            content: result.userQuery
        };
        setChatMessages(prev => [...prev, aiQueryMessage]);

        toast({
          variant: "destructive",
          title: "Anomaly Detected!",
          description: "Vigil requires your attention in the AI Assistant panel.",
        })
      } else {
        // Optional: Log successful, non-malicious scans to the timeline if desired
        // const newIncident: Incident = {
        //     time: new Date().toISOString(),
        //     title: "System Scan Completed",
        //     description: "No malicious activity was found.",
        //     details: "System state analyzed by Vigil AI.",
        //     isMalicious: false,
        // };
        // setIncidents(prev => [newIncident, ...prev].slice(0, 20));
      }
    } catch (error) {
       console.error("Threat reasoning failed:", error);
        toast({
          variant: "destructive",
          title: "Error Running System Check",
          description: "Could not analyze system state.",
        });
    }
  };

  useEffect(() => {
    runSystemCheck();
    const intervalId = setInterval(runSystemCheck, 30000); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <AiChatbot userName={userName} initialMessages={chatMessages} />
              </CardContent>
            </Card>
          </div>
        </div>
        <Tabs defaultValue="threats">
          <TabsList className="grid w-full grid-cols-5 md:w-auto md:inline-flex bg-secondary">
            <TabsTrigger value="threats">Active Threats</TabsTrigger>
            <TabsTrigger value="knowledge_graph">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="policies">Policy Adaptation</TabsTrigger>
            <TabsTrigger value="reports">Report Generation</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
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
           <TabsContent value="knowledge_graph">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Cyber Knowledge Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeGraph />
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
          <TabsContent value="share">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Share Application</CardTitle>
              </CardHeader>
              <CardContent>
                <Share />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
