
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Phone, Mail, Home, User, Calendar, MoreHorizontal } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import PaginationComponent from '@/components/common/PaginationComponent';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  useRequireAuth();
  const isMobile = useIsMobile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    totalItems: totalCustomers, 
    itemsPerPage: ITEMS_PER_PAGE 
  });

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalCustomers(count || 0);

      // Fetch paginated customers
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
        .range(from, to);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error('Error loading customers: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to add a customer');
        return;
      }

      const { error } = await supabase.from('customers').insert({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address || null,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Customer added successfully!');
      setIsDialogOpen(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (error: any) {
      toast.error('Error adding customer: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailOpen(true);
  };

  const renderMobileView = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {customers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No customers found.
            </CardContent>
          </Card>
        ) : (
          customers.map((customer) => (
            <Card key={customer.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleCustomerClick(customer)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderDesktopView = () => {
    if (isLoading) {
      return (
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
      );
    }

    return (
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div>{customer.email}</div>
                      <div className="text-gray-500">{customer.phone}</div>
                    </TableCell>
                    <TableCell className="text-gray-500">{customer.address || 'Not provided'}</TableCell>
                    <TableCell className="text-gray-500">{formatDate(customer.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleCustomerClick(customer)}>View</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsDialogOpen(true)}
          >
            <UserPlus className="mr-1" /> {!isMobile && "Add New Customer"}
          </Button>
        </div>

        {/* Customer Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={newCustomer.name} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={newCustomer.email} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={newCustomer.phone} 
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={newCustomer.address} 
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Customer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Customer Detail Sheet (Mobile) */}
        <Sheet open={isCustomerDetailOpen} onOpenChange={setIsCustomerDetailOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Customer Details</SheetTitle>
            </SheetHeader>
            
            {selectedCustomer && (
              <div className="py-6 space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mb-2">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-semibold">{selectedCustomer.name}</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-2 border-b">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{selectedCustomer.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 border-b">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 border-b">
                    <Home className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{selectedCustomer.address || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-2 border-b">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Customer since</p>
                      <p>{formatDate(selectedCustomer.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <SheetFooter className="pt-4">
              <Button className="w-full">View Rental History</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Conditionally render based on screen size */}
        {isMobile ? renderMobileView() : renderDesktopView()}
        
        {/* Pagination Component */}
        <PaginationComponent
          currentPage={currentPage}
          pageItems={pageItems}
          totalPages={totalPages}
          onPageChange={goToPage}
          onPrevious={goToPreviousPage}
          onNext={goToNextPage}
        />
      </div>
    </DashboardLayout>
  );
};

export default Customers;
