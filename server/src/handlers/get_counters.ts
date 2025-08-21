import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';

export const getCounters = async (): Promise<Counter[]> => {
  try {
    // Fetch all counters from the database
    const results = await db.select()
      .from(countersTable)
      .execute();

    // Return the results directly - no numeric conversions needed for integer columns
    return results;
  } catch (error) {
    console.error('Get counters failed:', error);
    throw error;
  }
};