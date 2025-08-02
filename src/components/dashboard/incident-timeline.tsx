import { FileWarning, ShieldAlert, VenetianMask, ShieldCheck } from "lucide-react"

const timelineEvents = [
  {
    time: "2024-05-21 14:35:10",
    title: "Anomalous Process Detected",
    description: "Process `evil.exe` (PID 4021) started from an unusual location.",
    icon: <FileWarning className="h-5 w-5 text-yellow-400" />,
    details: "Matched signature `ADWARE_GEN.2`."
  },
  {
    time: "2024-05-21 14:36:02",
    title: "Suspicious Network Activity",
    description: "`evil.exe` attempted connection to `198.51.100.24` (C2 server).",
    icon: <ShieldAlert className="h-5 w-5 text-destructive" />,
    details: "IP associated with known botnet 'ShadowNet'."
  },
  {
    time: "2024-05-21 14:36:15",
    title: "Incident Response Triggered",
    description: "Process `evil.exe` (PID 4021) was automatically quarantined.",
    icon: <ShieldCheck className="h-5 w-5 text-primary" />,
    details: "AI reasoning: High confidence of malicious activity."
  },
  {
    time: "2024-05-21 14:37:00",
    title: "Attacker Profile Updated",
    description: "Profile for 'ShadowNet' group updated with new TTPs.",
    icon: <VenetianMask className="h-5 w-5 text-accent" />,
    details: "Techniques: Masquerading, C2 Communication."
  },
]

export function IncidentTimeline() {
  return (
    <div className="relative pl-8 after:absolute after:inset-y-0 after:w-px after:bg-border after:left-4">
      {timelineEvents.map((event, index) => (
        <div key={index} className="grid grid-cols-[auto_1fr] items-start gap-x-4 mb-6 last:mb-0">
          <div className="flex items-center justify-center -translate-x-1/2">
            <div className="h-8 w-8 rounded-full bg-card border-2 border-background flex items-center justify-center z-10">
              {event.icon}
            </div>
          </div>
          <div className="flex flex-col pt-1">
             <div className="text-xs text-muted-foreground">{event.time}</div>
             <h4 className="font-semibold text-foreground leading-tight">{event.title}</h4>
             <p className="text-sm text-muted-foreground">{event.description}</p>
             <p className="text-xs text-accent/80 mt-1 font-mono">{event.details}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
