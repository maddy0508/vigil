import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const threats = [
  { id: "THR-001", description: "Unsigned binary executed from /tmp", severity: "High", status: "New", timestamp: "2m ago" },
  { id: "THR-002", description: "Potential SQL Injection attempt on auth service", severity: "High", status: "New", timestamp: "5m ago" },
  { id: "THR-003", description: "Anomalous login from a new geographical location", severity: "Medium", status: "Action Recommended", timestamp: "1h ago" },
  { id: "THR-004", description: "Port scan detected from internal IP 10.1.1.5", severity: "Low", status: "Quarantined", timestamp: "3h ago" },
  { id: "THR-005", description: "Repeated failed login attempts for user 'admin'", severity: "Medium", status: "Action Recommended", timestamp: "4h ago" },
]

export function ThreatsTable() {
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
        {threats.map((threat) => (
          <TableRow key={threat.id}>
            <TableCell>
              <Badge variant={getBadgeVariant(threat.severity)}>
                {threat.severity}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">{threat.description}</TableCell>
            <TableCell>{threat.status}</TableCell>
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
                  <DropdownMenuItem>Quarantine</DropdownMenuItem>
                  <DropdownMenuItem>Dismiss</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
