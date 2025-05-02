
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{rental.customer?.name || t('rentals.unknown')}</h3>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">{t('common.status')}</div>
          <div className="text-sm text-gray-900">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${getStatusBadgeColor(rental.status)}`}>
              {t(`statuses.${rental.status}`)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">{t('common.date')}</div>
          <div className="text-sm text-gray-900">{formatDate(rental.created_at)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">{t('rentals.mainItem')}</div>
          <div className="text-sm text-gray-900">
            {rental.clothing_item?.name || t('rentals.unknown')}
            <span className="text-xs text-gray-500 ml-2">({t('rentals.size')}: {rental.clothing_item?.size || 'N/A'})</span>
          </div>
        </div>

        {rental.rental_items && rental.rental_items.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium text-gray-500">{t('rentals.additionalItems')}</div>
            <div className="text-sm text-gray-900">
              <ul className="list-disc pl-2">
                {rental.rental_items.map(item => (
                  <li key={item.id}>
                    {item.clothing_item?.name} ({t('rentals.size')}: {item.clothing_item?.size})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">{t('rentals.rentalPeriod')}</div>
          <div className="text-sm text-gray-900">
            {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium text-gray-500">{t('rentals.totalPrice')}</div>
          <div className="text-sm text-gray-900">
            ${rental.total_price.toFixed(2)}
            {rental.additional_fees && rental.additional_fees > 0 && (
              <span className="text-xs text-gray-500 ml-2">
                (+ ${rental.additional_fees.toFixed(2)} {t('rentals.fees')})
              </span>
            )}
          </div>
        </div>

        {rental.return_condition && (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium text-gray-500">{t('rentals.returnCondition')}</div>
            <div className="text-sm text-gray-900">{t(`conditions.${rental.return_condition}`)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCard;
