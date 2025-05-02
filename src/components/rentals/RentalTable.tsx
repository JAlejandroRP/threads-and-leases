
import { Rental } from '@/types/rental';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusBadgeColor } from '@/lib/utils';
import { Eye, Trash2, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface RentalTableProps {
  rentals: Rental[];
  onStatusChange: (rental: Rental) => void;
  onReturnItem: (rental: Rental) => void;
  onDelete: (rental: Rental) => void;
  onViewDetails: (rental: Rental) => void;
}

const RentalTable = ({ 
  rentals, 
  onStatusChange, 
  onReturnItem, 
  onDelete,
  onViewDetails 
}: RentalTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('rentals.customer')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('rentals.items')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('rentals.dates')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.price')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rentals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  {t('common.noResults')}
                </td>
              </tr>
            ) : (
              rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{rental.customer?.name || t('rentals.unknown')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{rental.clothing_item?.name || t('rentals.unknown')}</div>
                    <div className="text-xs text-gray-500">{t('rentals.size')}: {rental.clothing_item?.size || 'N/A'}</div>

                    {/* Additional rental items */}
                    {rental.rental_items && rental.rental_items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 font-medium">{t('rentals.additionalItems')}:</p>
                        <ul className="text-xs text-gray-500 list-disc pl-4">
                          {rental.rental_items.map(item => (
                            <li key={item.id}>
                              {item.clothing_item?.name} ({t('rentals.size')}: {item.clothing_item?.size})
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
                      {t(`statuses.${rental.status}`)}
                    </span>
                    {rental.return_condition && (
                      <div className="mt-1 text-xs text-gray-500">
                        {t('rentals.returnCondition')}: {t(`conditions.${rental.return_condition}`)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${rental.total_price.toFixed(2)}</div>
                    {rental.additional_fees && rental.additional_fees > 0 && (
                      <div className="text-xs text-gray-500">
                        + ${rental.additional_fees.toFixed(2)} {t('rentals.fees')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-md">
                        <DropdownMenuLabel>{t('common.actions')}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(rental)} className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          <span>{t('common.view')} {t('common.details')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(rental)} className="cursor-pointer">
                          <span>{t('rentals.changeStatus')}</span>
                        </DropdownMenuItem>
                        {rental.status === 'active' && (
                          <DropdownMenuItem onClick={() => onReturnItem(rental)} className="cursor-pointer">
                            <span>{t('rentals.returnItem')}</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(rental)} 
                          className="text-red-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t('common.delete')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
