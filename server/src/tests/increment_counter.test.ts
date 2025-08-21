import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CounterOperationInput } from '../schema';
import { incrementCounter } from '../handlers/increment_counter';
import { eq } from 'drizzle-orm';

describe('incrementCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment counter by default amount (1)', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 5
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: 1 // Default value from Zod schema
    };

    const result = await incrementCounter(input);

    // Verify the counter was incremented
    expect(result.id).toEqual(counter.id);
    expect(result.name).toEqual('Test Counter');
    expect(result.value).toEqual(6); // 5 + 1
    expect(result.created_at).toEqual(counter.created_at);
    expect(result.updated_at).not.toEqual(counter.updated_at);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment counter by specified amount', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 10
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: 5
    };

    const result = await incrementCounter(input);

    // Verify the counter was incremented by the specified amount
    expect(result.value).toEqual(15); // 10 + 5
    expect(result.updated_at).not.toEqual(counter.updated_at);
  });

  it('should handle negative increment (decrement)', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 20
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: -3
    };

    const result = await incrementCounter(input);

    // Verify the counter was decremented
    expect(result.value).toEqual(17); // 20 + (-3)
    expect(result.updated_at).not.toEqual(counter.updated_at);
  });

  it('should save changes to database', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 8
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: 2
    };

    await incrementCounter(input);

    // Query the database to verify the change was persisted
    const [updatedCounter] = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, counter.id))
      .execute();

    expect(updatedCounter.value).toEqual(10); // 8 + 2
    expect(updatedCounter.updated_at).not.toEqual(counter.updated_at);
    expect(updatedCounter.updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent counter', async () => {
    const input: CounterOperationInput = {
      id: 999, // Non-existent counter ID
      amount: 1
    };

    await expect(incrementCounter(input)).rejects.toThrow(/Counter with id 999 not found/i);
  });

  it('should handle zero increment', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 42
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: 0
    };

    const result = await incrementCounter(input);

    // Value should remain the same, but updated_at should change
    expect(result.value).toEqual(42);
    expect(result.updated_at).not.toEqual(counter.updated_at);
  });

  it('should handle large increment values', async () => {
    // Create a test counter
    const [counter] = await db.insert(countersTable)
      .values({
        name: 'Test Counter',
        value: 1000
      })
      .returning()
      .execute();

    const input: CounterOperationInput = {
      id: counter.id,
      amount: 999999
    };

    const result = await incrementCounter(input);

    // Verify large increment works correctly
    expect(result.value).toEqual(1000999); // 1000 + 999999
  });
});