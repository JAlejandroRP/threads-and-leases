
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Rental {
  id: string;
  created_at: string;
  customer_id: string;
  clothing_item_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending_adjustment' | 'pending_creation' | 'ready';
  total_price: number;
  return_notes?: string | null;
  return_condition?: string | null;
  additional_fees?: number | null;
  customer: {
    name: string;
  };
  clothing_item: {
    name: string;
    size: string;
  };
  rental_items?: RentalItem[];
}

interface RentalItem {
  id: string;
  rental_id: string;
  clothing_item_id: string;
  price: number;
  clothing_item: {
    name: string;
    size: string;
  };
}

const Rentals = () => {
  useRequireAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<string>('good');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [additionalFees, setAdditionalFees] = useState<string>('0');
  const [newStatus, setNewStatus] = useState<string>('');
  
  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customer:customer_id(name),
          clothing_item:clothing_item_id(name, size)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch rental items for each rental
      const rentalsWithItems = await Promise.all((data || []).map(async (rental) => {
        const { data: rentalItems, error: itemsError } = await supabase
          .from('rental_items')
          .select(`
            *,
            clothing_item:clothing_item_id(name, size)
          `)
          .eq('rental_id', rental.id);
        
        if (itemsError) {
          console.error("Error fetching rental items:", itemsError);
          return rental;
        }
        
        return {
          ...rental,
          rental_items: rentalItems || []
        };
      }));
      
      setRentals(rentalsWithItems);
    } catch (error: any) {
      toast.error('Error loading rentals: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRental || !newStatus) return;
    
    try {
      const { error } = await supabase
        .from('rentals')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedRental.id);
      
      if (error) throw error;

      // If status is ready or completed, update clothing item availability
      if (newStatus === 'ready' || newStatus === 'completed') {
        // Update main clothing item
        const { error: itemError } = await supabase
          .from('clothing_items')
          .update({ available: newStatus === 'completed' ? true : false })
          .eq('id', selectedRental.clothing_item_id);
        
        if (itemError) throw itemError;
        
        // Update any rental items if they exist
        if (selectedRental.rental_items && selectedRental.rental_items.length > 0) {
          for (const item of selectedRental.rental_items) {
            const { error: rentalItemError } = await supabase
              .from('clothing_items')
              .update({ available: newStatus === 'completed' ? true : false })
              .eq('id', item.clothing_item_id);
            
            if (rentalItemError) throw rentalItemError;
          }
        }
      }

      toast.success(`Rental status updated to ${newStatus}`);
      setIsStatusDialogOpen(false);
      fetchRentals();
    } catch (error: any) {
      toast.error('Error updating status: ' + error.message);
    }
  };

  const handleReturnItem = async () => {
    if (!selectedRental) return;
    
    try {
      const numAdditionalFees = parseFloat(additionalFees) || 0;
      const newTotalPrice = selectedRental.total_price + numAdditionalFees;
      
      const { error } = await supabase
        .from('rentals')
        .update({ 
          status: 'completed', 
          updated_at: new Date().toISOString(),
          return_condition: returnCondition,
          return_notes: returnNotes,
          additional_fees: numAdditionalFees,
          total_price: newTotalPrice
        })
        .eq('id', selectedRental.id);
      
      if (error) throw error;

      // Update clothing item availability
      const { error: itemError } = await supabase
        .from('clothing_items')
        .update({ available: true })
        .eq('id', selectedRental.clothing_item_id);
      
      if (itemError) throw itemError;
      
      // Update any rental items if they exist
      if (selectedRental.rental_items && selectedRental.rental_items.length > 0) {
        for (const item of selectedRental.rental_items) {
          const { error: rentalItemError } = await supabase
            .from('clothing_items')
            .update({ available: true })
            .eq('id', item.clothing_item_id);
          
          if (rentalItemError) throw rentalItemError;
        }
      }

      toast.success('Item returned successfully');
      setIsReturnDialogOpen(false);
      resetReturnForm();
      fetchRentals();
    } catch (error: any) {
      toast.error('Error returning item: ' + error.message);
    }
  };

  const resetReturnForm = () => {
    setReturnCondition('good');
    setReturnNotes('');
    setAdditionalFees('0');
    setSelectedRental(null);
  };
  
  const openReturnDialog = (rental: Rental) => {
    setSelectedRental(rental);
    setIsReturnDialogOpen(true);
  };
  
  const openStatusDialog = (rental: Rental) => {
    setSelectedRental(rental);
    setNewStatus(rental.status);
    setIsStatusDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'pending_adjustment':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_creation':
        return 'bg-purple-100 text-purple-800';
      case 'ready':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending_adjustment':
        return 'Pending Adjustment';
      case 'pending_creation':
        return 'Being Created';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rentals</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/rentals/new')}
          >
            Create New Rental
          </Button>
        </div>

        {/* Return Item Dialog */}
        <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Return Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="return-condition">Condition upon return</Label>
                <Select value={returnCondition} onValueChange={setReturnCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="severely_damaged">Severely Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return-notes">Notes</Label>
                <Textarea
                  id="return-notes"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Add any notes about the returned item"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="additional-fees">Additional Fees ($)</Label>
                <Input
                  id="additional-fees"
                  type="number"
                  min="0"
                  step="0.01"
                  value={additionalFees}
                  onChange={(e) => setAdditionalFees(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleReturnItem}>Complete Return</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Rental Status</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending_adjustment">Pending Adjustment</SelectItem>
                    <SelectItem value="pending_creation">Being Created</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleStatusUpdate}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="animate-pulse p-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3 py-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item(s)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        No rentals found. Create your first rental!
                      </td>
                    </tr>
                  ) : (
                    rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{rental.customer?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{rental.clothing_item?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">Size: {rental.clothing_item?.size || 'N/A'}</div>
                          
                          {/* Additional rental items */}
                          {rental.rental_items && rental.rental_items.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 font-medium">Additional items:</p>
                              <ul className="text-xs text-gray-500 list-disc pl-4">
                                {rental.rental_items.map(item => (
                                  <li key={item.id}>
                                    {item.clothing_item?.name} (Size: {item.clothing_item?.size})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${getStatusBadgeColor(rental.status)}`}>
                            {getStatusDisplayName(rental.status)}
                          </span>
                          {rental.return_condition && (
                            <div className="mt-1 text-xs text-gray-500">
                              Returned: {rental.return_condition}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${rental.total_price.toFixed(2)}</div>
                          {rental.additional_fees && rental.additional_fees > 0 && (
                            <div className="text-xs text-gray-500">
                              + ${rental.additional_fees.toFixed(2)} fees
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusDialog(rental)}
                            >
                              Change Status
                            </Button>
                            {rental.status === 'active' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openReturnDialog(rental)}
                              >
                                Return Item
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Rentals;
