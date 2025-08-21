import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const decrementCounter = async (input: CounterOperationInput): Promise<Counter> => {
  try {
    // Use SQL to atomically decrement the counter value and update timestamp
    const result = await db.update(countersTable)
      .set({
        value: sql`${countersTable.value} - ${input.amount}`,
        updated_at: sql`now()`
      })
      .where(eq(countersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Counter with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Counter decrement failed:', error);
    throw error;
  }
};