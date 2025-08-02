'use server';

/**
 * @fileOverview This file defines the policy adaptation manager flow, which automatically adjusts security policies based on past incident analysis and the evolving threat landscape.
 *
 * - adaptSecurityPolicy - A function that handles the policy adaptation process.
 * - AdaptSecurityPolicyInput - The input type for the adaptSecurityPolicy function.
 * - AdaptSecurityPolicyOutput - The return type for the adaptSecurityPolicy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptSecurityPolicyInputSchema = z.object({
  incidentData: z
    .string()
    .describe(
      'Detailed data from past security incidents, including logs, attack vectors, and system responses.'
    ),
  threatLandscape: z
    .string()
    .describe(
      'Information about the current threat landscape, including new vulnerabilities, attack patterns, and emerging threats.'
    ),
  currentPolicies: z
    .string()
    .describe('The current security policies in place.'),
});
export type AdaptSecurityPolicyInput = z.infer<typeof AdaptSecurityPolicyInputSchema>;

const AdaptSecurityPolicyOutputSchema = z.object({
  updatedPolicies: z
    .string()
    .describe(
      'The updated security policies, incorporating changes based on incident data and threat landscape analysis.'
    ),
  justification: z
    .string()
    .describe(
      'A detailed explanation of why the policies were updated, including the specific threats or vulnerabilities addressed.'
    ),
});
export type AdaptSecurityPolicyOutput = z.infer<typeof AdaptSecurityPolicyOutputSchema>;

export async function adaptSecurityPolicy(
  input: AdaptSecurityPolicyInput
): Promise<AdaptSecurityPolicyOutput> {
  return adaptSecurityPolicyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptSecurityPolicyPrompt',
  input: {schema: AdaptSecurityPolicyInputSchema},
  output: {schema: AdaptSecurityPolicyOutputSchema},
  prompt: `You are an expert security administrator tasked with adapting security policies based on incident data and the current threat landscape.

  Analyze the provided incident data, threat landscape, and current policies to identify areas for improvement.

  Based on your analysis, generate updated security policies and provide a detailed justification for the changes.

  Incident Data: {{{incidentData}}}
  Threat Landscape: {{{threatLandscape}}}
  Current Policies: {{{currentPolicies}}}

  Updated Policies:`, // The prompt is expected to generate updated policies.
});

const adaptSecurityPolicyFlow = ai.defineFlow(
  {
    name: 'adaptSecurityPolicyFlow',
    inputSchema: AdaptSecurityPolicyInputSchema,
    outputSchema: AdaptSecurityPolicyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
