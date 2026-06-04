'use server';
/**
 * @fileOverview An AI assistant flow for generating mechanic aid suggestions for job card creation.
 *
 * - mechanicAidJobCardCreation - A function that takes reported issues and vehicle details to suggest tasks, parts, and labor costs.
 * - MechanicAidJobCardCreationInput - The input type for the mechanicAidJobCardCreation function.
 * - MechanicAidJobCardCreationOutput - The return type for the mechanicAidJobCardCreation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MechanicAidJobCardCreationInputSchema = z.object({
  reportedIssue: z
    .string()
    .describe("The customer's reported issue or problem with the vehicle."),
  vehicleMake: z.string().describe('The make of the vehicle (e.g., Toyota, Ford).'),
  vehicleModel: z.string().describe('The model of the vehicle (e.g., Camry, F-150).'),
  vehicleYear: z.number().int().describe('The manufacturing year of the vehicle.'),
});
export type MechanicAidJobCardCreationInput = z.infer<
  typeof MechanicAidJobCardCreationInputSchema
>;

const MechanicAidJobCardCreationOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('A list of potential repair tasks based on the reported issue.'),
  requiredParts: z
    .array(
      z.object({
        name: z.string().describe('The name of the required spare part.'),
        quantity: z
          .number()
          .int()
          .positive()
          .describe('The estimated quantity of the part needed.'),
      })
    )
    .describe('A list of required spare parts with estimated quantities.'),
  estimatedLaborCost: z
    .number()
    .positive()
    .describe('The estimated total labor cost in USD for the repair.'),
});
export type MechanicAidJobCardCreationOutput = z.infer<
  typeof MechanicAidJobCardCreationOutputSchema
>;

export async function mechanicAidJobCardCreation(
  input: MechanicAidJobCardCreationInput
): Promise<MechanicAidJobCardCreationOutput> {
  return mechanicAidJobCardCreationFlow(input);
}

const mechanicAidJobCardCreationPrompt = ai.definePrompt({
  name: 'mechanicAidJobCardCreationPrompt',
  input: {schema: MechanicAidJobCardCreationInputSchema},
  output: {schema: MechanicAidJobCardCreationOutputSchema},
  prompt: `You are an expert automotive mechanic and diagnostician.

A customer has reported an issue with their vehicle. Your task is to analyze the reported issue along with the vehicle details and then suggest:
1. A concise list of potential repair tasks.
2. A list of required spare parts, including the estimated quantity for each.
3. An estimated total labor cost in USD for the repair job.

Be professional, accurate, and provide only the necessary information for a job card.

Customer Reported Issue: {{{reportedIssue}}}
Vehicle Make: {{{vehicleMake}}}
Vehicle Model: {{{vehicleModel}}}
Vehicle Year: {{{vehicleYear}}}`,
});

const mechanicAidJobCardCreationFlow = ai.defineFlow(
  {
    name: 'mechanicAidJobCardCreationFlow',
    inputSchema: MechanicAidJobCardCreationInputSchema,
    outputSchema: MechanicAidJobCardCreationOutputSchema,
  },
  async input => {
    const {output} = await mechanicAidJobCardCreationPrompt(input);
    return output!;
  }
);
