import { z } from 'zod';

// Counter schema
export const counterSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Counter = z.infer<typeof counterSchema>;

// Input schema for creating counters
export const createCounterInputSchema = z.object({
  name: z.string().min(1, "Counter name is required")
});

export type CreateCounterInput = z.infer<typeof createCounterInputSchema>;

// Input schema for counter operations
export const counterOperationInputSchema = z.object({
  id: z.number(),
  amount: z.number().int().default(1) // Default increment/decrement by 1
});

export type CounterOperationInput = z.infer<typeof counterOperationInputSchema>;

// Input schema for getting a specific counter
export const getCounterInputSchema = z.object({
  id: z.number()
});

export type GetCounterInput = z.infer<typeof getCounterInputSchema>;