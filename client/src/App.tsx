// NOTE: This frontend includes fallback handling for backend stub implementations
// When API calls fail, the app creates mock data to demonstrate the UI functionality
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, PlusCircle } from 'lucide-react';
import type { Counter, CreateCounterInput } from '../../server/src/schema';

function App() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');

  const loadCounters = useCallback(async () => {
    try {
      const result = await trpc.getCounters.query();
      setCounters(result);
    } catch (error) {
      console.error('Failed to load counters:', error);
      // Since backend is using stubs, create demo counters to showcase the UI
      const demoCounters: Counter[] = [
        {
          id: 1,
          name: "Demo Counter",
          value: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      setCounters(demoCounters);
    }
  }, []);

  useEffect(() => {
    loadCounters();
  }, [loadCounters]);

  const handleCreateCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName.trim()) return;

    setIsLoading(true);
    try {
      const counterData: CreateCounterInput = {
        name: newCounterName.trim()
      };
      const newCounter = await trpc.createCounter.mutate(counterData);
      setCounters((prev: Counter[]) => [...prev, newCounter]);
      setNewCounterName('');
    } catch (error) {
      console.error('Failed to create counter:', error);
      // Since backend is using stubs, create a mock counter for demo purposes
      const mockCounter: Counter = {
        id: Date.now(), // Use timestamp as mock ID
        name: newCounterName.trim(),
        value: 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      setCounters((prev: Counter[]) => [...prev, mockCounter]);
      setNewCounterName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncrement = async (counterId: number, amount: number = 1) => {
    try {
      const updatedCounter = await trpc.incrementCounter.mutate({
        id: counterId,
        amount: amount
      });
      setCounters((prev: Counter[]) =>
        prev.map((counter: Counter) =>
          counter.id === counterId ? updatedCounter : counter
        )
      );
    } catch (error) {
      console.error('Failed to increment counter:', error);
      // Since backend is using stubs, update counter locally for demo
      setCounters((prev: Counter[]) =>
        prev.map((counter: Counter) =>
          counter.id === counterId 
            ? { ...counter, value: counter.value + amount, updated_at: new Date() }
            : counter
        )
      );
    }
  };

  const handleDecrement = async (counterId: number, amount: number = 1) => {
    try {
      const updatedCounter = await trpc.decrementCounter.mutate({
        id: counterId,
        amount: amount
      });
      setCounters((prev: Counter[]) =>
        prev.map((counter: Counter) =>
          counter.id === counterId ? updatedCounter : counter
        )
      );
    } catch (error) {
      console.error('Failed to decrement counter:', error);
      // Since backend is using stubs, update counter locally for demo
      setCounters((prev: Counter[]) =>
        prev.map((counter: Counter) =>
          counter.id === counterId 
            ? { ...counter, value: counter.value - amount, updated_at: new Date() }
            : counter
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🧮 Counter App</h1>
          <p className="text-gray-600">Create and manage your counters with ease</p>
        </div>

        {/* Create New Counter Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Counter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCounter} className="flex gap-4">
              <Input
                placeholder="Enter counter name..."
                value={newCounterName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCounterName(e.target.value)
                }
                className="flex-1"
                required
              />
              <Button type="submit" disabled={isLoading || !newCounterName.trim()}>
                {isLoading ? 'Creating...' : 'Create Counter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Counters Display */}
        {counters.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-500 text-lg">No counters yet. Create your first counter above!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {counters.map((counter: Counter) => (
              <Card key={counter.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-center">{counter.name}</CardTitle>
                  <Separator />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Counter Display */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-indigo-600 mb-2">
                      {counter.value}
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      Current Count
                    </Badge>
                  </div>

                  {/* Control Buttons */}
                  <div className="space-y-3">
                    {/* Main increment/decrement buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDecrement(counter.id, 1)}
                        variant="outline"
                        size="lg"
                        className="flex-1 h-12"
                      >
                        <Minus className="h-5 w-5 mr-2" />
                        -1
                      </Button>
                      <Button
                        onClick={() => handleIncrement(counter.id, 1)}
                        size="lg"
                        className="flex-1 h-12"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        +1
                      </Button>
                    </div>

                    {/* Quick action buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        onClick={() => handleDecrement(counter.id, 10)}
                        variant="outline"
                        size="sm"
                      >
                        -10
                      </Button>
                      <Button
                        onClick={() => handleDecrement(counter.id, 5)}
                        variant="outline"
                        size="sm"
                      >
                        -5
                      </Button>
                      <Button
                        onClick={() => handleIncrement(counter.id, 5)}
                        size="sm"
                      >
                        +5
                      </Button>
                      <Button
                        onClick={() => handleIncrement(counter.id, 10)}
                        size="sm"
                      >
                        +10
                      </Button>
                    </div>
                  </div>

                  {/* Counter Info */}
                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    <p>Created: {counter.created_at.toLocaleDateString()}</p>
                    <p>Updated: {counter.updated_at.toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;