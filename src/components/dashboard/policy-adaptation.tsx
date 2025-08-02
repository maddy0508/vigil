import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"

export function PolicyAdaptation() {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border bg-card-foreground/5">
        <h4 className="font-semibold">Firewall Rule Update</h4>
        <p className="text-sm text-muted-foreground">Based on recent 'ShadowNet' activity, a new egress rule is suggested.</p>
        <div className="mt-3 text-sm font-mono bg-muted p-3 rounded-md space-y-1">
          <div><span className="text-destructive">- DENY</span> <span className="text-muted-foreground">ALL FROM 198.51.100.0/24</span></div>
          <div><span className="text-green-400">+ BLOCK</span> <span className="text-foreground">EGRESS TO 198.51.100.0/24</span></div>
        </div>
      </div>
       <div className="p-4 rounded-lg border bg-card-foreground/5">
        <h4 className="font-semibold">Access Control Policy</h4>
        <p className="text-sm text-muted-foreground">To mitigate insider threats, enforce MFA for all users accessing the production database.</p>
         <div className="mt-3 text-sm font-mono bg-muted p-3 rounded-md">
          <div><span className="text-green-400">+ REQUIRE</span> <span className="text-foreground">mfa_completed=true IF resource='prod_db'</span></div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button>
          <Check className="mr-2 h-4 w-4" />
          Apply All Suggestions
        </Button>
      </div>
    </div>
  )
}
