
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackagePlus } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import PaginationComponent from '@/components/common/PaginationComponent';

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

const ITEMS_PER_PAGE = 9;

const Inventory = () => {
  useRequireAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    size: '',
    category: '',
    condition: 'Excellent',
    rental_price: '',
    image_url: ''
  });

  const { 
    currentPage, 
    pageItems, 
    totalPages, 
    from, 
    to,
    goToNextPage, 
    goToPreviousPage, 
    goToPage 
  } = usePagination({ 
    totalItems, 
    itemsPerPage: ITEMS_PER_PAGE 
  });

  useEffect(() => {
    fetchInventory();
  }, [currentPage]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('clothing_items')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalItems(count || 0);

      // Fetch paginated items
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('name')
        .range(from, to);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Error loading inventory: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.size || !newItem.category || !newItem.condition || !newItem.rental_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const rentalPrice = parseFloat(newItem.rental_price);
      if (isNaN(rentalPrice) || rentalPrice <= 0) {
        toast.error('Please enter a valid rental price');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('clothing_items').insert({
        name: newItem.name,
        description: newItem.description || null,
        size: newItem.size,
        category: newItem.category,
        condition: newItem.condition,
        rental_price: rentalPrice,
        image_url: newItem.image_url || null,
        available: true
      });

      if (error) throw error;

      toast.success('Item added successfully!');
      setIsDialogOpen(false);
      setNewItem({
        name: '',
        description: '',
        size: '',
        category: '',
        condition: 'Excellent',
        rental_price: '',
        image_url: ''
      });
      fetchInventory();
    } catch (error: any) {
      toast.error('Error adding item: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsDialogOpen(true)}
          >
            <PackagePlus className="mr-1" /> Add New Item
          </Button>
        </div>

        {/* Item Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={newItem.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    value={newItem.description} 
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size *</Label>
                    <Input 
                      id="size" 
                      name="size"
                      value={newItem.size} 
                      onChange={handleInputChange}
                      required
                      placeholder="S, M, L, XL, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dress">Dress</SelectItem>
                        <SelectItem value="Suit">Suit</SelectItem>
                        <SelectItem value="Gown">Gown</SelectItem>
                        <SelectItem value="Jacket">Jacket</SelectItem>
                        <SelectItem value="Pants">Pants</SelectItem>
                        <SelectItem value="Shirt">Shirt</SelectItem>
                        <SelectItem value="Shoes">Shoes</SelectItem>
                        <SelectItem value="Accessory">Accessory</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <Select 
                      value={newItem.condition} 
                      onValueChange={(value) => handleSelectChange('condition', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rental_price">Daily Rental Price ($) *</Label>
                    <Input 
                      id="rental_price" 
                      name="rental_price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newItem.rental_price} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input 
                    id="image_url" 
                    name="image_url"
                    value={newItem.image_url} 
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
          <>
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
                          <span className="text-sm text-gray-500">Price:</span>
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

            {/* Pagination Component */}
            <PaginationComponent
              currentPage={currentPage}
              pageItems={pageItems}
              totalPages={totalPages}
              onPageChange={goToPage}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
