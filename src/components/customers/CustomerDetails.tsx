import { Customer } from '@/services/customerService';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Home, Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface CustomerDetailsProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetails = ({ customer, isOpen, onClose }: CustomerDetailsProps) => {
  if (!customer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mb-2">
              {customer.name.charAt(0)}
            </div>
            <h2 className="text-xl font-semibold">{customer.name}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-2 border-b">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 border-b">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{customer.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 border-b">
              <Home className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{customer.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 border-b">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Customer since</p>
                <p>{formatDate(customer.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="pt-4">
          <Button className="w-full">View Rental History</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}; 