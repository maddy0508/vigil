
'use server';
/**
 * @fileOverview A flow for ingesting security data into a conceptual knowledge graph.
 *
 * - ingestIntoKnowledgeGraph - Analyzes unstructured security data and extracts a graph of entities and relationships.
 * - KnowledgeGraphInput - The input type for the ingestIntoKnowledgeGraph function.
 * - KnowledgeGraphOutput - The return type for the ingestIntoKnowledge-graph function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KnowledgeGraphInputSchema = z.object({
  dataType: z.enum(['threat_report', 'ioc_feed', 'network_log', 'osint_data'])
    .describe('The type of data being ingested.'),
  data: z.string().describe('The raw data content to be ingested and analyzed. This can be a text report, a log entry, or a JSON object of IOCs.'),
});
export type KnowledgeGraphInput = z.infer<typeof KnowledgeGraphInputSchema>;


const NodeSchema = z.object({
    id: z.string().describe("A unique identifier for the node (e.g., 'IP_192.168.1.1', 'CVE_CVE-2021-44228')."),
    type: z.string().describe("The type of the entity (e.g., 'IP', 'Domain', 'ThreatActor', 'Malware', 'CVE')."),
    label: z.string().describe("A human-readable label for the node (e.g., '192.168.1.1', 'example.com', 'ShadowBrokers')."),
    properties: z.record(z.any()).optional().describe("A dictionary of additional properties for the node."),
});

const EdgeSchema = z.object({
    source: z.string().describe("The ID of the source node for the relationship."),
    target: z.string().describe("The ID of the target node for the relationship."),
    label: z.string().describe("A description of the relationship (e.g., 'RESOLVES_TO', 'COMMUNICATES_WITH', 'USES', 'EXPLOITS')."),
    weight: z.number().optional().describe("A weight or confidence score for the relationship."),
});


const KnowledgeGraphOutputSchema = z.object({
  nodes: z.array(NodeSchema).describe("A list of identified entities (nodes) from the ingested data."),
  edges: z.array(EdgeSchema).describe("A list of identified relationships (edges) between the entities."),
  summary: z.string().describe("A high-level summary of the findings from the data ingestion."),
});
export type KnowledgeGraphOutput = z.infer<typeof KnowledgeGraphOutputSchema>;


export async function ingestIntoKnowledgeGraph(
  input: KnowledgeGraphInput
): Promise<KnowledgeGraphOutput> {
  return knowledgeGraphFlow(input);
}

const knowledgeGraphPrompt = ai.definePrompt({
  name: 'knowledgeGraphPrompt',
  input: {schema: KnowledgeGraphInputSchema},
  output: {schema: KnowledgeGraphOutputSchema},
  prompt: `You are a cybersecurity expert specializing in creating knowledge graphs from diverse data sources. Your task is to analyze the provided data, identify key cybersecurity entities, and map the relationships between them.

Data Type: {{{dataType}}}
Data Content:
{{{data}}}

Instructions:
1.  **Identify Entities (Nodes):** From the data, extract all relevant cybersecurity entities. Assign a unique ID, a type, and a human-readable label to each.
    *   **Types**: Use consistent types like 'IP', 'Domain', 'URL', 'FileHash', 'ThreatActor', 'Malware', 'Vulnerability', 'CVE', 'Hostname', 'Email'.
    *   **IDs**: Create IDs by combining the type and a unique value, e.g., 'IP_192.168.1.1' or 'CVE_CVE-2021-44228'.
2.  **Identify Relationships (Edges):** Determine the connections between the entities you identified. Define the relationship with a clear label.
    *   **Labels**: Use descriptive labels like 'RESOLVES_TO' (Domain to IP), 'COMMUNICATES_WITH' (IP to IP), 'HOSTS' (IP to Domain), 'USES' (ThreatActor to Malware), 'EXPLOITS' (Malware to CVE).
3.  **Generate Summary:** Provide a brief, high-level summary of the information you extracted and the relationships you identified.

Produce the output in the specified JSON format with nodes and edges.
`,
});

const knowledgeGraphFlow = ai.defineFlow(
  {
    name: 'knowledgeGraphFlow',
    inputSchema: KnowledgeGraphInputSchema,
    outputSchema: KnowledgeGraphOutputSchema,
  },
  async input => {
    const {output} = await knowledgeGraphPrompt(input);
    return output!;
  }
);
