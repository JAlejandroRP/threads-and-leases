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
import RentalTable from '@/components/rentals/RentalTable';
import RentalCard from '@/components/rentals/RentalCard';
import { Rental } from '@/types/rental';
import { PostgrestError } from '@supabase/supabase-js';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { formatDate, generatePagination } from '@/lib/utils';
import { ItemDetailsDialog } from '@/components/inventory/ItemDetailsDialog';

const ITEMS_PER_PAGE = 5;

const Rentals = () => {
  useRequireAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [totalRentals, setTotalRentals] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<string>('good');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [additionalFees, setAdditionalFees] = useState<string>('0');
  const [newStatus, setNewStatus] = useState<string>('');
  
  useEffect(() => {
    fetchRentals();
  }, [currentPage]);

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

  const fetchRentals = async () => {
    try {
      setIsLoading(true);
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalRentals(count || 0);
      
      // Fetch paginated rentals
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          customer:customer_id(name),
          clothing_item:clothing_item_id(name, size)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

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
    } catch (error) {
      const err = error as PostgrestError;
      toast.error('Error loading rentals: ' + err.message);
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
    } catch (error) {
      const err = error as PostgrestError;
      toast.error('Error updating status: ' + err.message);
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
    } catch (error) {
      const err = error as PostgrestError;
      toast.error('Error returning item: ' + err.message);
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

  const handleDelete = async () => {
    if (!selectedRental) return;
    
    try {
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', selectedRental.id);
      
      if (error) throw error;
      
      toast.success('Rental deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchRentals();
    } catch (error) {
      const err = error as PostgrestError;
      toast.error('Error deleting rental: ' + err.message);
    }
  };

  const openDeleteDialog = (rental: Rental) => {
    setSelectedRental(rental);
    setIsDeleteDialogOpen(true);
  };
  
  const viewDetails = (rental: Rental) => {
    setSelectedRental(rental);
    setIsDetailsDialogOpen(true);
  };

  const totalPages = Math.ceil(totalRentals / ITEMS_PER_PAGE);
  const pagination = generatePagination(currentPage, totalPages);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Rentals</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
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

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Rental</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this rental? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Details Dialog */}
        {selectedRental && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Rental Details</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Customer Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedRental.customer?.name || 'Unknown'}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Main Item</h3>
                  <p><span className="font-medium">Name:</span> {selectedRental.clothing_item?.name || 'Unknown'}</p>
                  <p><span className="font-medium">Size:</span> {selectedRental.clothing_item?.size || 'N/A'}</p>
                </div>
                
                {selectedRental.rental_items && selectedRental.rental_items.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">Additional Items</h3>
                    <ul className="list-disc pl-5">
                      {selectedRental.rental_items.map(item => (
                        <li key={item.id}>
                          {item.clothing_item?.name} (Size: {item.clothing_item?.size})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Rental Information</h3>
                  <p><span className="font-medium">Period:</span> {formatDate(selectedRental.start_date)} - {formatDate(selectedRental.end_date)}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusBadgeColor(selectedRental.status)}`}>
                      {getStatusDisplayName(selectedRental.status)}
                    </span>
                  </p>
                  <p><span className="font-medium">Total Price:</span> ${selectedRental.total_price.toFixed(2)}</p>
                  {selectedRental.additional_fees && selectedRental.additional_fees > 0 && (
                    <p><span className="font-medium">Additional Fees:</span> ${selectedRental.additional_fees.toFixed(2)}</p>
                  )}
                  {selectedRental.return_condition && (
                    <p><span className="font-medium">Return Condition:</span> {selectedRental.return_condition}</p>
                  )}
                  {selectedRental.return_notes && (
                    <p><span className="font-medium">Return Notes:</span> {selectedRental.return_notes}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

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
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <RentalTable
                rentals={rentals}
                onStatusChange={openStatusDialog}
                onReturnItem={openReturnDialog}
                onDelete={openDeleteDialog}
                onViewDetails={viewDetails}
              />
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {rentals.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No rentals found. Create your first rental!
                </div>
              ) : (
                rentals.map((rental) => (
                  <RentalCard
                    key={rental.id}
                    rental={rental}
                    onStatusChange={openStatusDialog}
                    onReturnItem={openReturnDialog}
                    onDelete={openDeleteDialog}
                    onViewDetails={viewDetails}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalRentals > ITEMS_PER_PAGE && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {pagination.map((page, i) => (
                    <PaginationItem key={i}>
                      {page === "..." ? (
                        <div className="flex h-9 w-9 items-center justify-center text-gray-400">...</div>
                      ) : (
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Rentals;
