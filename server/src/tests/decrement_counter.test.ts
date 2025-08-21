import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput } from '../schema';
import { decrementCounter } from '../handlers/decrement_counter';
import { eq } from 'drizzle-orm';

describe('decrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should decrement a counter by default amount (1)', async () => {
    // Create a test counter
    const createResult = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 10
      })
      .returning()
      .execute();

    const testCounter = createResult[0];
    const testInput: CounterOperationInput = {
      id: testCounter.id,
      amount: 1 // Default amount
    };

    const result = await decrementCounter(testInput);

    // Verify the counter was decremented
    expect(result.id).toEqual(testCounter.id);
    expect(result.name).toEqual('Test Counter');
    expect(result.value).toEqual(9); // 10 - 1
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testCounter.updated_at.getTime());
  });

  it('should decrement a counter by specified amount', async () => {
    // Create a test counter with initial value
    const createResult = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 100
      })
      .returning()
      .execute();

    const testCounter = createResult[0];
    const testInput: CounterOperationInput = {
      id: testCounter.id,
      amount: 25
    };

    const result = await decrementCounter(testInput);

    // Verify the counter was decremented by the specified amount
    expect(result.id).toEqual(testCounter.id);
    expect(result.name).toEqual('Test Counter');
    expect(result.value).toEqual(75); // 100 - 25
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should allow counter to go negative', async () => {
    // Create a test counter with small initial value
    const createResult = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 5
      })
      .returning()
      .execute();

    const testCounter = createResult[0];
    const testInput: CounterOperationInput = {
      id: testCounter.id,
      amount: 10
    };

    const result = await decrementCounter(testInput);

    // Verify the counter went negative
    expect(result.value).toEqual(-5); // 5 - 10
    expect(result.id).toEqual(testCounter.id);
    expect(result.name).toEqual('Test Counter');
  });

  it('should save the decremented value to database', async () => {
    // Create a test counter
    const createResult = await db.insert(countersTable)
      .values({
        name: 'Persistent Counter',
        value: 50
      })
      .returning()
      .execute();

    const testCounter = createResult[0];
    const testInput: CounterOperationInput = {
      id: testCounter.id,
      amount: 15
    };

    await decrementCounter(testInput);

    // Query the database to verify the value was saved
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, testCounter.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(35); // 50 - 15
    expect(counters[0].name).toEqual('Persistent Counter');
    expect(counters[0].updated_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at.getTime()).toBeGreaterThan(testCounter.updated_at.getTime());
  });

  it('should throw error when counter does not exist', async () => {
    const testInput: CounterOperationInput = {
      id: 999, // Non-existent counter ID
      amount: 5
    };

    await expect(decrementCounter(testInput))
      .rejects.toThrow(/Counter with id 999 not found/i);
  });

  it('should handle zero decrement amount', async () => {
    // Create a test counter
    const createResult = await db.insert(countersTable)
      .values({
        name: 'Zero Test Counter',
        value: 42
      })
      .returning()
      .execute();

    const testCounter = createResult[0];
    const testInput: CounterOperationInput = {
      id: testCounter.id,
      amount: 0
    };

    const result = await decrementCounter(testInput);

    // Value should remain the same but updated_at should change
    expect(result.value).toEqual(42); // 42 - 0
    expect(result.id).toEqual(testCounter.id);
    expect(result.name).toEqual('Zero Test Counter');
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(testCounter.updated_at.getTime());
  });
});