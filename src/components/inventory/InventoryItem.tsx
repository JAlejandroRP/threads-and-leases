import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { ClothingItem } from '@/hooks/use-inventory';

interface InventoryItemProps {
  item: ClothingItem;
  onView: (item: ClothingItem) => void;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

export const InventoryItem = ({
  item,
  onView,
  onEdit,
  onDelete
}: InventoryItemProps) => {
  return (
    <Card className="group relative">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="pr-8">{item.name}</CardTitle>
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 text-gray-500">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(item)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Item
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(item)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4 cursor-pointer" onClick={() => onView(item)}>
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="h-40 object-cover rounded-md"
            />
          ) : (
            <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Category:</span>
            <span className="text-sm font-medium">{item.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Size:</span>
            <span className="text-sm font-medium">{item.size}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Condition:</span>
            <span className="text-sm font-medium">{item.condition}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="text-sm font-medium">${item.rental_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status:</span>
            <span className={`text-sm font-medium ${item.available ? 'text-green-600' : 'text-red-600'}`}>
              {item.available ? 'Available' : 'Rented'}
            </span>
          </div>
        </div>
        {item.description && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{item.description}</p>
        )}
      </CardContent>
      <CardFooter className="hidden md:flex pt-2 justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onView(item)}
          className="w-10 h-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(item)}
          className="w-10 h-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(item)}
          className="w-10 h-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}; 