
'use server';

/**
 * @fileOverview AI chatbot flow for answering user questions about system security.
 *
 * - aiChatbot - A function that processes user queries and returns information about system security.
 * - AIChatbotInput - The input type for the aiChatbot function.
 * - AIChatbotOutput - The return type for the aiChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { blockIpAddress, changeSystemSetting, uninstallProgram } from '../tools/system-actions';

const AIChatbotInputSchema = z.object({
  query: z.string().describe('The user query about the system security.'),
  userName: z.string().describe("The user's name."),
});
export type AIChatbotInput = z.infer<typeof AIChatbotInputSchema>;

const AIChatbotOutputSchema = z.object({
  response: z.string().describe('The AI chatbot response to the user query.'),
});
export type AIChatbotOutput = z.infer<typeof AIChatbotOutputSchema>;


export async function aiChatbot(input: AIChatbotInput): Promise<AIChatbotOutput> {
  return aiChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotPrompt',
  input: {schema: AIChatbotInputSchema},
  output: {schema: AIChatbotOutputSchema},
  tools: [blockIpAddress, uninstallProgram, changeSystemSetting],
  prompt: `You are Vigil, a friendly and expert AI security assistant. Your user's name is {{userName}}.
  You are an expert in all terminals, shells, and programming languages.
  You maintain and have access to comprehensive logs of all system activities, including every change made to the device. You regularly audit all system components.
  You are conversational, helpful, and you are here to help {{userName}} keep their system secure.

  If the user asks you to perform an action, use the available tools to do so. For example, you can block an IP address, uninstall a program, or change a setting.

  User Query: {{{query}}}

  Provide a concise and informative response to the user's query, based on your knowledge of the system's security.
  Address the user by their name, {{userName}}, where appropriate.
  If the user is asking for security status or a list of potential threats, make sure to include those in the answer.
  If the user is asking for an action to take, recommend one or execute it if you can. Use your reasoning and audit logs to decide when or if something is malicious and suggest or implement actions.
  Do not make up facts or information. Rely on the detailed logs and your continuous audit.`,
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AIChatbotInputSchema,
    outputSchema: z.object({ response: z.string() }),
  },
  async (input) => {
    const {output} = await ai.generate({
        prompt: prompt.prompt,
        input,
        tools: prompt.tools,
        model: 'googleai/gemini-2.0-flash'
    });
    
    return output!;
  }
);
