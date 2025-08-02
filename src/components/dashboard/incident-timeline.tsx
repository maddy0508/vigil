import { FileWarning, ShieldAlert, VenetianMask, ShieldCheck, Activity } from "lucide-react"
import { formatDistanceToNow } from 'date-fns';

export type Incident = {
  time: string;
  title: string;
  description: string;
  details: string;
  isMalicious: boolean;
  attackerSummary?: string;
};

interface IncidentTimelineProps {
  incidents: Incident[];
}

const getIcon = (incident: Incident) => {
    if (!incident.isMalicious) {
        return <Activity className="h-5 w-5 text-gray-400" />
    }
    if (incident.attackerSummary) {
        return <VenetianMask className="h-5 w-5 text-accent" />
    }
    if (incident.title.includes('Network')) {
        return <ShieldAlert className="h-5 w-5 text-destructive" />
    }
    if (incident.title.includes('Response')) {
        return <ShieldCheck className="h-5 w-5 text-primary" />
    }
    return <FileWarning className="h-5 w-5 text-yellow-400" />;
}


export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2"/>
        <p>Awaiting system events...</p>
        <p className="text-xs">The simulation is running.</p>
      </div>
    )
  }

  return (
    <div className="relative pl-8 after:absolute after:inset-y-0 after:w-px after:bg-border after:left-4">
      {incidents.map((event, index) => (
        <div key={index} className="grid grid-cols-[auto_1fr] items-start gap-x-4 mb-6 last:mb-0">
          <div className="flex items-center justify-center -translate-x-1/2">
            <div className="h-8 w-8 rounded-full bg-card border-2 border-background flex items-center justify-center z-10">
              {getIcon(event)}
            </div>
          </div>
          <div className="flex flex-col pt-1">
             <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.time), { addSuffix: true })}
             </div>
             <h4 className="font-semibold text-foreground leading-tight">{event.title}</h4>
             <p className="text-sm text-muted-foreground">{event.description}</p>
             <p className="text-xs text-accent/80 mt-1 font-mono">{event.details}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
