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

const AIChatbotInputSchema = z.object({
  query: z.string().describe('The user query about the system security.'),
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
  prompt: `You are an AI chatbot specializing in providing information about the system's security status, potential threats, and recommended actions. You have deep expertise in all terminals, shells, and programming languages. You maintain and have access to comprehensive logs of all system activities, including every change made to the device. You regularly audit all system components.

  User Query: {{{query}}}

  Provide a concise and informative response to the user's query, based on your knowledge of the system's security.
  Consider logs, descriptors, and system states when answering questions.
  If the user is asking for security status or a list of potential threats, make sure to include those in the answer.
  If the user is asking for an action to take, recommend one. Use your reasoning and audit logs to decide when or if something is malicious and suggest or implement actions.
  Do not make up facts or information. Rely on the detailed logs and your continuous audit.`,
});

const aiChatbotFlow = ai.defineFlow(
  {
    name: 'aiChatbotFlow',
    inputSchema: AIChatbotInputSchema,
    outputSchema: AIChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
