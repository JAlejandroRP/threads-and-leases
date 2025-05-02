
import { Rental } from '@/types/rental';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadgeColor, getStatusDisplayName } from '@/lib/utils';
import { Eye, Trash2, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface RentalCardProps {
  rental: Rental;
  onStatusChange: (rental: Rental) => void;
  onReturnItem: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
  onViewDetails: (rental: Rental) => void;
}

const RentalCard = ({ 
  rental, 
  onStatusChange, 
  onReturnItem, 
  onDelete,
  onViewDetails 
}: RentalCardProps) => {
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
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{rental.customer?.name || 'Unknown'}</h3>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewDetails(rental)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(rental)} className="cursor-pointer">
                <span>Change Status</span>
              </DropdownMenuItem>
              {rental.status === 'active' && (
                <DropdownMenuItem onClick={() => onReturnItem(rental)} className="cursor-pointer">
                  <span>Return Item</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(rental)} 
                className="text-red-600 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Status</div>
          <div className="text-sm text-gray-900">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${getStatusBadgeColor(rental.status)}`}>
              {getStatusDisplayName(rental.status)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Date</div>
          <div className="text-sm text-gray-900">{formatDate(rental.created_at)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Main Item</div>
          <div className="text-sm text-gray-900">
            {rental.clothing_item?.name || 'Unknown'}
            <span className="text-xs text-gray-500 ml-2">(Size: {rental.clothing_item?.size || 'N/A'})</span>
          </div>
        </div>

        {rental.rental_items && rental.rental_items.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium text-gray-500">Additional Items</div>
            <div className="text-sm text-gray-900">
              <ul className="list-disc pl-2">
                {rental.rental_items.map(item => (
                  <li key={item.id}>
                    {item.clothing_item?.name} (Size: {item.clothing_item?.size})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Rental Period</div>
          <div className="text-sm text-gray-900">
            {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">Total Price</div>
          <div className="text-sm text-gray-900">
            ${rental.total_price.toFixed(2)}
            {rental.additional_fees && rental.additional_fees > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                (+ ${rental.additional_fees.toFixed(2)} fees)
              </span>
            )}
          </div>
        </div>

        {rental.return_condition && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium text-gray-500">Return Condition</div>
            <div className="text-sm text-gray-900">{rental.return_condition}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCard;
