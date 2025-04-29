
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Rental {
  id: string;
  created_at: string;
  customer_id: string;
  clothing_item_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  total_price: number;
  customer: {
    name: string;
  };
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
      setRentals(data || []);
    } catch (error: any) {
      toast.error('Error loading rentals: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnItem = async (rentalId: string) => {
    try {
      // Update rental status
      const { error: rentalError } = await supabase
        .from('rentals')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', rentalId);
      
      if (rentalError) throw rentalError;

      // Get the clothing item id from the rental
      const { data: rentalData, error: fetchError } = await supabase
        .from('rentals')
        .select('clothing_item_id')
        .eq('id', rentalId)
        .single();
      
      if (fetchError) throw fetchError;

      // Update the clothing item availability
      const { error: itemError } = await supabase
        .from('clothing_items')
        .update({ available: true })
        .eq('id', rentalData.clothing_item_id);
      
      if (itemError) throw itemError;

      toast.success('Item returned successfully');
      fetchRentals(); // Refresh the list
    } catch (error: any) {
      toast.error('Error returning item: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                      Item
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{rental.clothing_item?.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">Size: {rental.clothing_item?.size || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(rental.start_date)} - {formatDate(rental.end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                              rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${rental.total_price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {rental.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReturnItem(rental.id)}
                            >
                              Return Item
                            </Button>
                          )}
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
