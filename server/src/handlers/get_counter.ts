import { db } from '../db';
import { countersTable } from '../db/schema';
import { type GetCounterInput, type Counter } from '../schema';
import { eq } from 'drizzle-orm';

export const getCounter = async (input: GetCounterInput): Promise<Counter | null> => {
  try {
    // Query for the specific counter by ID
    const results = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, input.id))
      .execute();

    // Return null if counter not found
    if (results.length === 0) {
      return null;
    }

    // Return the found counter
    return results[0];
  } catch (error) {
    console.error('Counter retrieval failed:', error);
    throw error;
  }
};