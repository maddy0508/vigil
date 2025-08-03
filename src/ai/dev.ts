import { config } from 'dotenv';
config();

import '@/ai/flows/incident-response-reasoning.ts';
import '@/ai/flows/threat-reasoning.ts';
import '@/ai/flows/policy-adaptation-manager.ts';
import '@/ai/flows/ai-chatbot.ts';
import '@/ai/flows/attacker-profile-generator.ts';
import '@/ai/tools/system-actions.ts';
import '@/ai/flows/knowledge-graph-manager.ts';
