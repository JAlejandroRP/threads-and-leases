
import { Rental } from '@/types/rental';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface RentalTableProps {
  rentals: Rental[];
  onStatusChange: (rental: Rental) => void;
  onReturnItem: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
}

const RentalTable = ({ rentals, onStatusChange, onReturnItem, onDelete }: RentalTableProps) => {
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
                    <div className="flex space-x-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(rental)}
                      >
                        Change Status
                      </Button>
                      {rental.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReturnItem(rental)}
                        >
                          Return Item
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(rental)}
                        className="hover:bg-red-100 bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentalTable;
