
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ShieldOff } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type Threat = {
  id: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  status: "New" | "Action Recommended" | "Quarantined" | "Neutralized";
  timestamp: string;
}

interface ThreatsTableProps {
  threats: Threat[];
}

export function ThreatsTable({ threats }: ThreatsTableProps) {
  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
     switch (status) {
      case 'Neutralized':
        return 'default';
       case 'Action Recommended':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Severity</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Timestamp</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {threats.length > 0 ? (
          threats.map((threat) => (
            <TableRow key={threat.id}>
              <TableCell>
                <Badge variant={getBadgeVariant(threat.severity)}>
                  {threat.severity}
                </Badge>
              </TableCell>
              <TableCell className="font-medium max-w-sm truncate">{threat.description}</TableCell>
              <TableCell>
                 <Badge variant={getStatusBadgeVariant(threat.status)}>
                  {threat.status}
                </Badge>
              </TableCell>
              <TableCell>{threat.timestamp}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Generate Report</DropdownMenuItem>
                    <DropdownMenuItem>Dismiss</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ShieldOff className="h-8 w-8"/>
                <p>No active threats detected.</p>
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
