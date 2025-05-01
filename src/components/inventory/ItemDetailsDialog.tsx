import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ClothingItem } from '@/hooks/use-inventory';

interface ItemDetailsDialogProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ItemDetailsDialog = ({
  item,
  isOpen,
  onClose
}: ItemDetailsDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex justify-center">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name}
                className="h-60 object-cover rounded-md" 
              />
            ) : (
              <div className="h-60 w-60 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {item.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Description:</p>
              <p className="text-sm">{item.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Size:</p>
              <p className="text-sm">{item.size}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Category:</p>
              <p className="text-sm">{item.category}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Condition:</p>
              <p className="text-sm">{item.condition}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Daily Rental Price:</p>
              <p className="text-sm">${item.rental_price.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status:</p>
              <p className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
                {item.available ? 'Available' : 'Rented'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 