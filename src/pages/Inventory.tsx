
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PackagePlus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import PaginationComponent from '@/components/common/PaginationComponent';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);

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
    
    if (isEditDialogOpen && editItem) {
      setEditItem(prev => ({ ...prev, [name]: value } as ClothingItem));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isEditDialogOpen && editItem) {
      setEditItem(prev => ({ ...prev, [name]: value } as ClothingItem));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
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

  const handleEdit = (item: ClothingItem) => {
    setEditItem({...item});
    setIsEditDialogOpen(true);
  };

  const handleView = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleDeleteConfirm = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;
      
      toast.success('Item deleted successfully!');
      setIsDeleteDialogOpen(false);
      fetchInventory();
    } catch (error: any) {
      toast.error('Error deleting item: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setSelectedItem(null);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    
    if (!editItem.name || !editItem.size || !editItem.category || !editItem.condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('clothing_items')
        .update({
          name: editItem.name,
          description: editItem.description,
          size: editItem.size,
          category: editItem.category,
          condition: editItem.condition,
          rental_price: editItem.rental_price,
          image_url: editItem.image_url
        })
        .eq('id', editItem.id);

      if (error) throw error;

      toast.success('Item updated successfully!');
      setIsEditDialogOpen(false);
      fetchInventory();
    } catch (error: any) {
      toast.error('Error updating item: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setEditItem(null);
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
            </DialogHeader>
            {editItem && (
              <form onSubmit={handleUpdateSubmit}>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Item Name *</Label>
                    <Input 
                      id="edit-name" 
                      name="name"
                      value={editItem.name} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea 
                      id="edit-description" 
                      name="description"
                      value={editItem.description || ''} 
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-size">Size *</Label>
                      <Input 
                        id="edit-size" 
                        name="size"
                        value={editItem.size} 
                        onChange={handleInputChange}
                        required
                        placeholder="S, M, L, XL, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category *</Label>
                      <Select 
                        value={editItem.category} 
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
                      <Label htmlFor="edit-condition">Condition *</Label>
                      <Select 
                        value={editItem.condition} 
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
                      <Label htmlFor="edit-rental_price">Daily Rental Price ($) *</Label>
                      <Input 
                        id="edit-rental_price" 
                        name="rental_price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editItem.rental_price} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-image_url">Image URL</Label>
                    <Input 
                      id="edit-image_url" 
                      name="image_url"
                      value={editItem.image_url || ''} 
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Item'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem?.name}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 py-2">
                <div className="flex justify-center">
                  {selectedItem.image_url ? (
                    <img 
                      src={selectedItem.image_url} 
                      alt={selectedItem.name}
                      className="h-60 object-cover rounded-md" 
                    />
                  ) : (
                    <div className="h-60 w-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                      No Image Available
                    </div>
                  )}
                </div>
                
                {selectedItem.description && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Description:</p>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Size:</p>
                    <p className="text-sm">{selectedItem.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Category:</p>
                    <p className="text-sm">{selectedItem.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Condition:</p>
                    <p className="text-sm">{selectedItem.condition}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Daily Rental Price:</p>
                    <p className="text-sm">${selectedItem.rental_price.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Status:</p>
                    <p className={`text-sm font-medium ${selectedItem.available ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedItem.available ? 'Available' : 'Rented'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the item{' '}
                <span className="font-bold">{selectedItem?.name}</span> from your inventory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-500 hover:bg-red-600"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                  <Card key={item.id} className="group relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="pr-8">{item.name}</CardTitle>
                        <div className="absolute top-4 right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-500">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(item)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteConfirm(item)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center mb-4 cursor-pointer" onClick={() => handleView(item)}>
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
                        <p className="mt-4 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="hidden md:flex pt-2 justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(item)}
                        className="w-10 h-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="w-10 h-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteConfirm(item)}
                        className="w-10 h-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
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
