import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type GetCounterInput } from '../schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a counter when found', async () => {
    // Create a test counter directly in the database
    const insertResult = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 42
      })
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    // Test the handler
    const testInput: GetCounterInput = {
      id: createdCounter.id
    };

    const result = await getCounter(testInput);

    // Verify the counter is returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdCounter.id);
    expect(result!.name).toEqual('Test Counter');
    expect(result!.value).toEqual(42);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when counter does not exist', async () => {
    const testInput: GetCounterInput = {
      id: 999 // Non-existent ID
    };

    const result = await getCounter(testInput);

    expect(result).toBeNull();
  });

  it('should return correct counter from multiple counters', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values([
        { name: 'Counter One', value: 10 },
        { name: 'Counter Two', value: 20 },
        { name: 'Counter Three', value: 30 }
      ])
      .execute();

    // Get all counters to find specific IDs
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(3);

    // Test getting the second counter
    const targetCounter = allCounters.find(c => c.name === 'Counter Two')!;
    const testInput: GetCounterInput = {
      id: targetCounter.id
    };

    const result = await getCounter(testInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(targetCounter.id);
    expect(result!.name).toEqual('Counter Two');
    expect(result!.value).toEqual(20);
  });

  it('should handle counter with default value correctly', async () => {
    // Create a counter without specifying value (should default to 0)
    const insertResult = await db.insert(countersTable)
      .values({
        name: 'Default Counter'
      })
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    const testInput: GetCounterInput = {
      id: createdCounter.id
    };

    const result = await getCounter(testInput);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Default Counter');
    expect(result!.value).toEqual(0); // Should have default value
  });

  it('should handle negative counter values correctly', async () => {
    // Create a counter with negative value
    const insertResult = await db.insert(countersTable)
      .values({
        name: 'Negative Counter',
        value: -15
      })
      .returning()
      .execute();

    const createdCounter = insertResult[0];

    const testInput: GetCounterInput = {
      id: createdCounter.id
    };

    const result = await getCounter(testInput);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Negative Counter');
    expect(result!.value).toEqual(-15);
  });
});