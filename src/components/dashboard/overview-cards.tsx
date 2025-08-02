"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart } from "recharts"
import { Activity, ShieldAlert, ShieldCheck } from "lucide-react"

const chartData = [
  { time: "12:00", cpu: 30 },
  { time: "12:05", cpu: 45 },
  { time: "12:10", cpu: 50 },
  { time: "12:15", cpu: 40 },
  { time: "12:20", cpu: 60 },
  { time: "12:25", cpu: 55 },
];

const chartConfig = {
  cpu: {
    label: "CPU",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function OverviewCards() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Normal</div>
          <p className="text-xs text-muted-foreground">
            CPU at 55%, Memory at 65%
          </p>
          <div className="h-[60px] w-full mt-2">
            <ChartContainer config={chartConfig} className="h-full w-full p-0">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cpu)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-cpu)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cpu" strokeWidth={2} stroke="var(--color-cpu)" fillOpacity={1} fill="url(#fillCpu)" />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" hideLabel />}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
          <ShieldAlert className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">
            2 High, 1 Medium severity
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full h-2 rounded-full bg-muted flex overflow-hidden">
              <div style={{width: "66.66%"}} className="bg-destructive h-2"></div>
              <div style={{width: "33.33%"}} className="bg-yellow-500 h-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Policy Status</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Compliant</div>
          <p className="text-xs text-muted-foreground">
            Last adapted: 2 hours ago
          </p>
          <div className="mt-4 flex items-center gap-2">
             <div className="text-sm font-medium">98% policies adapted</div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
