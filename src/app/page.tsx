import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VigilLogo } from "@/components/vigil-logo";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { IncidentTimeline } from "@/components/dashboard/incident-timeline";
import { AiChatbot } from "@/components/dashboard/ai-chatbot";
import { ThreatsTable } from "@/components/dashboard/threats-table";
import { PolicyAdaptation } from "@/components/dashboard/policy-adaptation";
import { ReportGeneration } from "@/components/dashboard/report-generation";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { RealtimeThreat } from "@/components/dashboard/realtime-threat";
import { SystemVectors } from "@/components/dashboard/system-vectors";

export default function DashboardPage() {
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
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="person face" />
            <AvatarFallback>V</AvatarFallback>
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
              <IncidentTimeline />
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
                <AiChatbot />
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
                <ThreatsTable />
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
