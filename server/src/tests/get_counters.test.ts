import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounters } from '../handlers/get_counters';

describe('getCounters', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no counters exist', async () => {
    const result = await getCounters();
    
    expect(result).toEqual([]);
  });

  it('should return all counters from database', async () => {
    // Create test counters
    await db.insert(countersTable)
      .values([
        { name: 'Test Counter 1', value: 5 },
        { name: 'Test Counter 2', value: 10 },
        { name: 'Test Counter 3', value: 0 }
      ])
      .execute();

    const result = await getCounters();

    // Should return 3 counters
    expect(result).toHaveLength(3);
    
    // Verify all expected fields are present
    result.forEach(counter => {
      expect(counter.id).toBeDefined();
      expect(typeof counter.id).toBe('number');
      expect(counter.name).toBeDefined();
      expect(typeof counter.name).toBe('string');
      expect(counter.value).toBeDefined();
      expect(typeof counter.value).toBe('number');
      expect(counter.created_at).toBeInstanceOf(Date);
      expect(counter.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific counter data
    const counterNames = result.map(c => c.name).sort();
    expect(counterNames).toEqual(['Test Counter 1', 'Test Counter 2', 'Test Counter 3']);
    
    const counterValues = result.map(c => c.value).sort((a, b) => a - b);
    expect(counterValues).toEqual([0, 5, 10]);
  });

  it('should return counters with default values when created without value', async () => {
    // Create counter without specifying value (should default to 0)
    await db.insert(countersTable)
      .values({ name: 'Default Counter' })
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Default Counter');
    expect(result[0].value).toEqual(0); // Should be default value
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle counters with negative values', async () => {
    // Create counter with negative value
    await db.insert(countersTable)
      .values({ name: 'Negative Counter', value: -5 })
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Negative Counter');
    expect(result[0].value).toEqual(-5);
  });

  it('should return counters in database order', async () => {
    // Create multiple counters in specific order
    const counter1 = await db.insert(countersTable)
      .values({ name: 'First Counter', value: 1 })
      .returning()
      .execute();
    
    const counter2 = await db.insert(countersTable)
      .values({ name: 'Second Counter', value: 2 })
      .returning()
      .execute();

    const result = await getCounters();

    expect(result).toHaveLength(2);
    
    // Should maintain insertion order (or database natural order)
    expect(result[0].id).toBeLessThan(result[1].id);
    expect(result[0].name).toEqual('First Counter');
    expect(result[1].name).toEqual('Second Counter');
  });
});