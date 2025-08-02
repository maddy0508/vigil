"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown } from "lucide-react"

export function ReportGeneration() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <p className="text-sm text-muted-foreground">
        Generate a detailed forensic report for an incident. Select an incident and report type.
      </p>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Incident</label>
        <Select>
            <SelectTrigger>
            <SelectValue placeholder="Select an incident..." />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="inc-001">INC-001: ShadowNet Breach</SelectItem>
            <SelectItem value="inc-002">INC-002: SQL Injection Attempt</SelectItem>
            <SelectItem value="inc-003">INC-003: Insider Data Exfiltration</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Report Type</label>
        <Select defaultValue="full_forensic">
            <SelectTrigger>
            <SelectValue placeholder="Select report type..." />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="full_forensic">Full Forensic Report</SelectItem>
            <SelectItem value="executive_summary">Executive Summary</SelectItem>
            <SelectItem value="timeline_only">Timeline of Events</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <Button className="w-full">
        <FileDown className="mr-2 h-4 w-4" />
        Generate & Download Report
      </Button>
    </div>
  )
}
