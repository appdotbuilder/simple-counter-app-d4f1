import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const incrementCounter = async (input: CounterOperationInput): Promise<Counter> => {
  try {
    // Update counter value atomically and return the updated record
    const result = await db.update(countersTable)
      .set({
        value: sql`${countersTable.value} + ${input.amount}`,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Counter with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Counter increment failed:', error);
    throw error;
  }
};