
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { ShieldAlert } from "lucide-react"

export function RealtimeThreat() {
  const { toast } = useToast()

  const showThreatToast = () => {
    toast({
      variant: "destructive",
      title: "High-Severity Threat Detected",
      description: "Malicious process `svchost.exe` detected. Recommend immediate quarantine.",
      action: (
        <>
          <ToastAction
            altText="Approve"
            className="bg-green-600 hover:bg-green-700 border-0 text-white"
            onClick={() => {
              console.log("Action Approved!")
              toast({
                title: "Action Approved",
                description: "The process has been quarantined.",
              })
            }}
          >
            Approve
          </ToastAction>
          <ToastAction
            altText="Deny"
            className="hover:bg-destructive-foreground/10"
            onClick={() => {
              console.log("Action Denied!")
              toast({
                title: "Action Denied",
                description: "The process was not quarantined. Please monitor the system.",
              })
            }}
          >
            Deny
          </ToastAction>
        </>
      ),
    })
  }
  
  // Simulate a real-time threat detection for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      showThreatToast()
    }, 5000) // Show toast after 5 seconds

    return () => clearTimeout(timer)
  }, [])


  return (
    <Button variant="outline" size="sm" onClick={showThreatToast}>
        <ShieldAlert className="h-4 w-4 mr-2 text-destructive"/>
        Simulate Threat
    </Button>
  )
}
