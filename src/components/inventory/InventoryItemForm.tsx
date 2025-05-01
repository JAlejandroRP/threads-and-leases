import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClothingItem, NewClothingItem } from '@/hooks/use-inventory';

interface InventoryItemFormProps {
  initialData?: ClothingItem;
  onSubmit: (data: NewClothingItem | ClothingItem) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const defaultFormData: NewClothingItem = {
  name: '',
  description: '',
  size: '',
  category: '',
  condition: 'Excellent',
  rental_price: '',
  image_url: ''
};

export const InventoryItemForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: InventoryItemFormProps) => {
  const [formData, setFormData] = useState<NewClothingItem>(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        size: initialData.size,
        category: initialData.category,
        condition: initialData.condition,
        rental_price: initialData.rental_price.toString(),
        image_url: initialData.image_url || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.size || !formData.category || !formData.condition || !formData.rental_price) {
      return;
    }

    const submitData = initialData 
      ? { ...initialData, ...formData, rental_price: parseFloat(formData.rental_price) }
      : formData;

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name *</Label>
        <Input 
          id="name" 
          name="name"
          value={formData.name} 
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description"
          value={formData.description} 
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size *</Label>
          <Input 
            id="size" 
            name="size"
            value={formData.size} 
            onChange={handleInputChange}
            required
            placeholder="S, M, L, XL, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => handleSelectChange('category', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dress">Dress</SelectItem>
              <SelectItem value="Suit">Suit</SelectItem>
              <SelectItem value="Gown">Gown</SelectItem>
              <SelectItem value="Jacket">Jacket</SelectItem>
              <SelectItem value="Pants">Pants</SelectItem>
              <SelectItem value="Shirt">Shirt</SelectItem>
              <SelectItem value="Shoes">Shoes</SelectItem>
              <SelectItem value="Accessory">Accessory</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="condition">Condition *</Label>
          <Select 
            value={formData.condition} 
            onValueChange={(value) => handleSelectChange('condition', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Excellent">Excellent</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rental_price">Daily Rental Price ($) *</Label>
          <Input 
            id="rental_price" 
            name="rental_price"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.rental_price} 
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input 
          id="image_url" 
          name="image_url"
          value={formData.image_url} 
          onChange={handleInputChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (initialData ? 'Updating...' : 'Adding...') : (initialData ? 'Update Item' : 'Add Item')}
        </Button>
      </div>
    </form>
  );
}; 