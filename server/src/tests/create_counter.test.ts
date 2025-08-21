import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type CreateCounterInput } from '../schema';
import { createCounter } from '../handlers/create_counter';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCounterInput = {
  name: 'Test Counter'
};

describe('createCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a counter with default value 0', async () => {
    const result = await createCounter(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Counter');
    expect(result.value).toEqual(0);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save counter to database', async () => {
    const result = await createCounter(testInput);

    // Query using proper drizzle syntax
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].name).toEqual('Test Counter');
    expect(counters[0].value).toEqual(0);
    expect(counters[0].created_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple counters with different names', async () => {
    const counter1 = await createCounter({ name: 'Counter 1' });
    const counter2 = await createCounter({ name: 'Counter 2' });

    expect(counter1.id).not.toEqual(counter2.id);
    expect(counter1.name).toEqual('Counter 1');
    expect(counter2.name).toEqual('Counter 2');
    expect(counter1.value).toEqual(0);
    expect(counter2.value).toEqual(0);

    // Verify both are in database
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(2);
    expect(allCounters.map(c => c.name)).toContain('Counter 1');
    expect(allCounters.map(c => c.name)).toContain('Counter 2');
    expect(allCounters.every(c => c.value === 0)).toBe(true);
  });

  it('should handle special characters in counter names', async () => {
    const specialNameInput: CreateCounterInput = {
      name: 'Test Counter with @#$%^&*() symbols'
    };

    const result = await createCounter(specialNameInput);

    expect(result.name).toEqual('Test Counter with @#$%^&*() symbols');
    expect(result.value).toEqual(0);

    // Verify it's saved correctly
    const saved = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(saved[0].name).toEqual('Test Counter with @#$%^&*() symbols');
  });

  it('should set created_at and updated_at to same initial time', async () => {
    const result = await createCounter(testInput);

    // They should be very close in time (within 1 second)
    const timeDifference = Math.abs(
      result.updated_at.getTime() - result.created_at.getTime()
    );
    expect(timeDifference).toBeLessThan(1000); // Less than 1 second difference
  });
});