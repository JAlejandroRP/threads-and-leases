
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClothingItem {
  id: string;
  name: string;
  description: string | null;
  size: string;
  category: string;
  condition: string;
  rental_price: number;
  available: boolean;
  image_url: string | null;
}

const Inventory = () => {
  useRequireAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Error loading inventory: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add New Item
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No inventory items found.</p>
                <p className="mt-2">Add your first item to get started.</p>
              </div>
            ) : (
              items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-4">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="h-40 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Size:</span>
                        <span className="text-sm font-medium">{item.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Condition:</span>
                        <span className="text-sm font-medium">{item.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price/Day:</span>
                        <span className="text-sm font-medium">${item.rental_price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <span className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                          {item.available ? 'Available' : 'Rented'}
                        </span>
                      </div>
                    </div>
                    {item.description && (
                      <p className="mt-4 text-sm text-gray-600">{item.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
