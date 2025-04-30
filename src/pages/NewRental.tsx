
import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ClothingItem {
  id: string;
  name: string;
  size: string;
  category: string;
  rental_price: number;
  available: boolean;
  description?: string | null;
}

interface RentalItem {
  id: string;
  clothing_item_id: string;
  clothing_item: ClothingItem;
  price: number;
  notes?: string;
}

const NewRental = () => {
  useRequireAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [selectedRentalItems, setSelectedRentalItems] = useState<RentalItem[]>([]);
  const [customSuit, setCustomSuit] = useState<ClothingItem | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedMainItem, setSelectedMainItem] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [manualPrice, setManualPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [rentalStatus, setRentalStatus] = useState<string>('active');
  const [needsAdjustment, setNeedsAdjustment] = useState(false);
  const [isCustomSuit, setIsCustomSuit] = useState(false);
  const [isPriceEditing, setIsPriceEditing] = useState(false);
  
  // New customer form
  const [newCustomer, setNewCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // New rental item
  const [selectedAdditionalItem, setSelectedAdditionalItem] = useState<string>('');
  const [additionalItemPrice, setAdditionalItemPrice] = useState<string>('');
  const [additionalItemNotes, setAdditionalItemNotes] = useState<string>('');

  useEffect(() => {
    loadCustomersAndItems();
  }, []);

  useEffect(() => {
    // When manual price changes, update total price
    if (isPriceEditing && manualPrice !== '') {
      setTotalPrice(parseFloat(manualPrice));
    }
  }, [manualPrice, isPriceEditing]);

  const loadCustomersAndItems = async () => {
    setIsLoading(true);
    try {
      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Fetch available clothing items
      const { data: itemsData, error: itemsError } = await supabase
        .from('clothing_items')
        .select('*')
        .order('name');

      if (itemsError) throw itemsError;
      
      // Find custom suit item
      const custom = itemsData?.find(item => item.category === 'Custom');
      if (custom) {
        setCustomSuit(custom);
      }
      
      setClothingItems(itemsData || []);
    } catch (error: any) {
      toast.error('Error loading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainItemSelection = (itemId: string) => {
    setSelectedMainItem(itemId);
    updateTotalPrice(itemId, selectedRentalItems);
  };

  const handleDateChange = () => {
    updateTotalPrice(selectedMainItem, selectedRentalItems);
  };

  const updateTotalPrice = (mainItemId: string, additionalItems: RentalItem[]) => {
    if (!startDate || !endDate || isPriceEditing) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate price for main item
    let mainPrice = 0;
    if (mainItemId) {
      const mainItem = clothingItems.find(item => item.id === mainItemId);
      if (mainItem) {
        mainPrice = mainItem.rental_price * days;
      }
    }
    
    // Add prices of additional items
    const additionalPrice = additionalItems.reduce((sum, item) => sum + item.price, 0);
    
    // Apply discount if any
    const discountAmount = parseFloat(discount) || 0;
    let calculatedPrice = mainPrice + additionalPrice;
    calculatedPrice = Math.max(0, calculatedPrice - discountAmount);
    
    setTotalPrice(calculatedPrice);
    setManualPrice(calculatedPrice.toString());
  };

  const handleAddRentalItem = () => {
    if (!selectedAdditionalItem || !additionalItemPrice) {
      toast.error('Please select an item and set a price');
      return;
    }
    
    const item = clothingItems.find(item => item.id === selectedAdditionalItem);
    if (!item) {
      toast.error('Selected item not found');
      return;
    }
    
    const price = parseFloat(additionalItemPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    
    const newItem: RentalItem = {
      id: `temp-${Date.now()}`, // Temporary ID
      clothing_item_id: item.id,
      clothing_item: item,
      price: price,
      notes: additionalItemNotes || undefined
    };
    
    const newItems = [...selectedRentalItems, newItem];
    setSelectedRentalItems(newItems);
    updateTotalPrice(selectedMainItem, newItems);
    
    // Reset form
    setSelectedAdditionalItem('');
    setAdditionalItemPrice('');
    setAdditionalItemNotes('');
  };

  const handleRemoveRentalItem = (index: number) => {
    const newItems = [...selectedRentalItems];
    newItems.splice(index, 1);
    setSelectedRentalItems(newItems);
    updateTotalPrice(selectedMainItem, newItems);
  };

  const handleClearMainItem = () => {
    setSelectedMainItem('');
    updateTotalPrice('', selectedRentalItems);
  };

  const handleDiscountChange = (value: string) => {
    setDiscount(value);
    if (!isPriceEditing) {
      updateTotalPrice(selectedMainItem, selectedRentalItems);
    }
  };

  const togglePriceEdit = () => {
    if (isPriceEditing) {
      // If we're ending editing mode, update the total price
      const newPrice = parseFloat(manualPrice);
      if (!isNaN(newPrice) && newPrice >= 0) {
        setTotalPrice(newPrice);
      } else {
        // If invalid manual price, revert to calculated price
        updateTotalPrice(selectedMainItem, selectedRentalItems);
      }
    } else {
      // Starting edit mode - initialize manual price with current total
      setManualPrice(totalPrice.toString());
    }
    
    setIsPriceEditing(!isPriceEditing);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let customerId = selectedCustomer;

      // If creating a new customer
      if (newCustomer) {
        if (!customerName || !customerEmail || !customerPhone) {
          toast.error('Please fill in all required customer fields');
          setIsLoading(false);
          return;
        }

        // Create new customer
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select();

        if (customerError) throw customerError;
        customerId = customerData?.[0]?.id;
      }

      // Validate required fields
      if (!customerId || !selectedMainItem || !startDate || !endDate) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
      
      // Determine status based on selections
      let status = rentalStatus;
      if (needsAdjustment) {
        status = 'pending_adjustment';
      } else if (isCustomSuit) {
        status = 'pending_creation';
      }

      // Create rental record
      const { data: rentalData, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          customer_id: customerId,
          clothing_item_id: selectedMainItem,
          start_date: startDate,
          end_date: endDate,
          status: status,
          notes: notes,
          total_price: totalPrice
        })
        .select();

      if (rentalError) throw rentalError;
      
      const rentalId = rentalData?.[0]?.id;
      if (!rentalId) throw new Error('Failed to get rental ID');

      // Add rental items if any
      if (selectedRentalItems.length > 0) {
        const rentalItemsToInsert = selectedRentalItems.map(item => ({
          rental_id: rentalId,
          clothing_item_id: item.clothing_item_id,
          price: item.price,
          notes: item.notes || null
        }));
        
        const { error: itemsError } = await supabase
          .from('rental_items')
          .insert(rentalItemsToInsert);
          
        if (itemsError) throw itemsError;
      }

      // Update clothing item availability if not custom or pending adjustment
      if (status === 'active') {
        // Update main item
        const { error: updateError } = await supabase
          .from('clothing_items')
          .update({ available: false })
          .eq('id', selectedMainItem);

        if (updateError) throw updateError;
        
        // Update additional items
        for (const item of selectedRentalItems) {
          const { error: itemError } = await supabase
            .from('clothing_items')
            .update({ available: false })
            .eq('id', item.clothing_item_id);
            
          if (itemError) throw itemError;
        }
      }

      toast.success('Rental created successfully!');
      navigate('/rentals');
    } catch (error: any) {
      toast.error('Error creating rental: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Rental</h1>
          <Button variant="outline" onClick={() => navigate('/rentals')}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rental Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                {!newCustomer ? (
                  <div className="space-y-2">
                    <Select 
                      value={selectedCustomer} 
                      onValueChange={setSelectedCustomer}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} - {customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-sm">
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-800"
                        onClick={() => setNewCustomer(true)}
                      >
                        + Add a new customer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <Input
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="text-sm">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setNewCustomer(false)}
                      >
                        Cancel - select existing customer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Order Types */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Order Type</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Checkbox 
                      id="needs-adjustment" 
                      checked={needsAdjustment} 
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setNeedsAdjustment(isChecked);
                        if (isChecked) setIsCustomSuit(false);
                      }}
                    />
                    <label htmlFor="needs-adjustment" className="ml-2 text-sm text-gray-700">
                      Needs Adjustment
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <Checkbox 
                      id="custom-suit" 
                      checked={isCustomSuit} 
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setIsCustomSuit(isChecked);
                        if (isChecked) {
                          setNeedsAdjustment(false);
                          // Auto-select custom suit item if available
                          if (customSuit) {
                            setSelectedMainItem(customSuit.id);
                            updateTotalPrice(customSuit.id, selectedRentalItems);
                          }
                        }
                      }}
                    />
                    <label htmlFor="custom-suit" className="ml-2 text-sm text-gray-700">
                      Custom Suit
                    </label>
                  </div>
                </div>
              </div>

              {/* Main Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Item *
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <Select 
                      value={selectedMainItem} 
                      onValueChange={handleMainItemSelection}
                      disabled={isLoading || (isCustomSuit && !!customSuit)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {clothingItems.length === 0 ? (
                          <SelectItem value="none" disabled>No items available</SelectItem>
                        ) : (
                          clothingItems
                            .filter(item => !isCustomSuit || item.category === 'Custom')
                            .map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - {item.category} (Size {item.size}) - ${item.rental_price}/day
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedMainItem && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleClearMainItem}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Items */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Items
                </label>
                
                {selectedRentalItems.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Price ($)</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRentalItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.clothing_item.name} (Size: {item.clothing_item.size})
                            </TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>{item.notes || '-'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveRentalItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <div className="border rounded-md p-4 space-y-4">
                  <h4 className="font-medium text-sm">Add Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Item
                      </label>
                      <Select 
                        value={selectedAdditionalItem} 
                        onValueChange={setSelectedAdditionalItem}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {clothingItems
                            .filter(item => item.available && item.id !== selectedMainItem && item.category !== 'Custom')
                            .map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} (${item.rental_price}/day)
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={additionalItemPrice}
                        onChange={(e) => setAdditionalItemPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <Input
                        value={additionalItemNotes}
                        onChange={(e) => setAdditionalItemNotes(e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline"
                      size="sm"
                      onClick={handleAddRentalItem}
                      disabled={!selectedAdditionalItem || !additionalItemPrice}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rental Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      handleDateChange();
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      handleDateChange();
                    }}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                  placeholder="Add any special requirements or instructions"
                  rows={3}
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => handleDiscountChange(e.target.value)}
                  disabled={isLoading || isPriceEditing}
                  placeholder="0.00"
                />
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={togglePriceEdit}
                    className="h-8 px-2"
                  >
                    {isPriceEditing ? "Save" : (
                      <>
                        <Edit className="h-4 w-4 mr-1" /> 
                        Edit
                      </>
                    )}
                  </Button>
                </div>
                {isPriceEditing ? (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="text-lg font-bold"
                  />
                ) : (
                  <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Rental...' : 'Create Rental'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewRental;
