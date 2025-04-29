
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
}

const NewRental = () => {
  useRequireAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  useEffect(() => {
    loadCustomersAndItems();
  }, []);

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
        .eq('available', true)
        .order('name');

      if (itemsError) throw itemsError;
      setClothingItems(itemsData || []);
    } catch (error: any) {
      toast.error('Error loading data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItem(itemId);
    const item = clothingItems.find((i) => i.id === itemId);
    if (item) {
      const start = new Date(startDate || new Date().toISOString().split('T')[0]);
      const end = new Date(endDate || start.toISOString().split('T')[0]);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      setTotalPrice(item.rental_price * days);
    }
  };

  const handleDateChange = () => {
    if (startDate && endDate && selectedItem) {
      const item = clothingItems.find((i) => i.id === selectedItem);
      if (item) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        setTotalPrice(item.rental_price * days);
      }
    }
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
      if (!customerId || !selectedItem || !startDate || !endDate) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create rental record
      const { error: rentalError } = await supabase
        .from('rentals')
        .insert({
          customer_id: customerId,
          clothing_item_id: selectedItem,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
          notes: notes,
          total_price: totalPrice
        });

      if (rentalError) throw rentalError;

      // Update clothing item availability
      const { error: updateError } = await supabase
        .from('clothing_items')
        .update({ available: false })
        .eq('id', selectedItem);

      if (updateError) throw updateError;

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

              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clothing Item *
                </label>
                <Select 
                  value={selectedItem} 
                  onValueChange={handleItemSelection}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {clothingItems.length === 0 ? (
                      <SelectItem value="none" disabled>No items available</SelectItem>
                    ) : (
                      clothingItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - {item.category} (Size {item.size}) - ${item.rental_price}/day
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Price
                </label>
                <div className="text-2xl font-bold">${totalPrice.toFixed(2)}</div>
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
