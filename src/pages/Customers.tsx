import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { usePagination } from '@/hooks/use-pagination';
import PaginationComponent from '@/components/common/PaginationComponent';
import { useIsMobile } from '@/hooks/use-mobile';
import { Customer, CustomerService, SupabaseCustomerService } from '@/services/customerService';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerList } from '@/components/customers/CustomerList';
import { CustomerDetails } from '@/components/customers/CustomerDetails';

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
  
  const customerService: CustomerService = new SupabaseCustomerService();
  
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
      const { data, count } = await customerService.getCustomers(from, to);
      setCustomers(data);
      setTotalCustomers(count);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      await customerService.addCustomer(customer);
      fetchCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailOpen(true);
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

        <CustomerForm 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleAddCustomer}
        />

        <CustomerList
          customers={customers}
          isLoading={isLoading}
          isMobile={isMobile}
          onCustomerClick={handleCustomerClick}
        />

        <CustomerDetails
          customer={selectedCustomer}
          isOpen={isCustomerDetailOpen}
          onClose={() => setIsCustomerDetailOpen(false)}
        />
        
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
