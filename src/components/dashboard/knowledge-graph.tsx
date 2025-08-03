
"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ingestIntoKnowledgeGraph, KnowledgeGraphOutput } from "@/ai/flows/knowledge-graph-manager"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Zap, Share2, BrainCircuit } from "lucide-react"

const sampleData = {
    "threat_report": `A new report from Mandiant details how the threat actor group FIN11 has been observed using the 'Clop' ransomware. They gain initial access by exploiting CVE-2023-1234 in unpatched firewalls and then use the domain evil-payload.com to download their malware payload (hash: a1b2c3d4...).`,
    "ioc_feed": `{"type": "domain", "value": "malicious-c2.com", "ip_address": "198.51.100.55"}`,
    "network_log": `{"timestamp": "2025-07-27T10:00:00Z", "hostname": "workstation-12", "src_ip": "10.0.0.5", "dest_ip": "198.51.100.55", "event_type": "dns_query", "details": "workstation-12 queried malicious-c2.com"}`
};

export function KnowledgeGraph() {
  const [dataType, setDataType] = useState<keyof typeof sampleData>("threat_report");
  const [dataContent, setDataContent] = useState(sampleData.threat_report)
  const [isLoading, setIsLoading] = useState(false)
  const [graphData, setGraphData] = useState<KnowledgeGraphOutput | null>(null)
  const { toast } = useToast()

  const handleDataTypeChange = (value: keyof typeof sampleData) => {
    setDataType(value);
    setDataContent(sampleData[value]);
    setGraphData(null);
  }
  
  const handleIngest = async () => {
    setIsLoading(true);
    setGraphData(null);
    try {
        const result = await ingestIntoKnowledgeGraph({
            dataType: dataType,
            data: dataContent,
        });
        setGraphData(result);
        toast({
            title: "Data Ingested",
            description: "The knowledge graph has been updated.",
        })
    } catch (error) {
        console.error("Failed to ingest data:", error);
        toast({
            variant: "destructive",
            title: "Ingestion Failed",
            description: "Could not process the data. Please try again.",
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Data Ingestion</h3>
        <p className="text-sm text-muted-foreground">Select a data type and provide the raw data to ingest into Vigil's knowledge graph. The AI will analyze it to extract entities and relationships.</p>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-medium text-muted-foreground">Data Type</label>
                <Select onValueChange={handleDataTypeChange} defaultValue={dataType}>
                    <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder="Select data type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="threat_report">Threat Report</SelectItem>
                        <SelectItem value="ioc_feed">IOC Feed</SelectItem>
                        <SelectItem value="network_log">Network Log</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <Button className="self-end w-full" onClick={handleIngest} disabled={isLoading || !dataContent.trim()}>
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Zap className="mr-2 h-4 w-4" />
                )}
                Analyze & Ingest Data
            </Button>
        </div>
        <div>
            <label className="text-xs font-medium text-muted-foreground">Data Content</label>
            <Textarea 
                value={dataContent}
                onChange={(e) => setDataContent(e.target.value)}
                placeholder="Paste your data here..."
                className="min-h-[200px] font-mono text-xs"
                disabled={isLoading}
            />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Graph Analysis Results</h3>
        <div className="p-4 rounded-lg border bg-card-foreground/5 min-h-[340px]">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <BrainCircuit className="h-10 w-10 mb-4 animate-pulse" />
                    <p className="font-semibold">AI is analyzing data...</p>
                    <p className="text-sm">Building knowledge graph...</p>
                </div>
            )}
            {!isLoading && !graphData && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>Results will be displayed here after ingestion.</p>
                </div>
            )}
            {graphData && (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-primary mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{graphData.summary}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-primary mb-2">Entities ({graphData.nodes.length})</h4>
                        <div className="flex flex-wrap gap-2">
                           {graphData.nodes.map(node => (
                             <div key={node.id} className="bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                                {node.type}: <span className="font-mono bg-background/50 px-1 rounded">{node.label}</span>
                             </div>
                           ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-primary mb-2">Relationships ({graphData.edges.length})</h4>
                        <div className="space-y-2 text-sm">
                            {graphData.edges.map(edge => (
                                <div key={`${edge.source}-${edge.target}`} className="flex items-center gap-2 font-mono text-muted-foreground">
                                    <span className="text-foreground font-sans bg-secondary px-2 py-0.5 rounded text-xs">{edge.source}</span>
                                    <Share2 className="h-4 w-4 text-accent"/>
                                    <span className="text-accent font-sans text-xs font-bold">{edge.label}</span>
                                    <Share2 className="h-4 w-4 text-accent -scale-x-100"/>
                                    <span className="text-foreground font-sans bg-secondary px-2 py-0.5 rounded text-xs">{edge.target}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}
