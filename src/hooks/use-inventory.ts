import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ClothingItem {
  id: string;
  name: string;
  description: string | null;
  size: string;
  category: string;
  condition: string;
  rental_price: number;
  available: boolean;
  image_url: string | null;
}

export interface NewClothingItem {
  name: string;
  description: string;
  size: string;
  category: string;
  condition: string;
  rental_price: string;
  image_url: string;
}

export const useInventory = (page: number, itemsPerPage: number) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      
      const { count, error: countError } = await supabase
        .from('clothing_items')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      setTotalItems(count || 0);

      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('name')
        .range(from, to);

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Error loading inventory: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (newItem: NewClothingItem) => {
    try {
      setIsSubmitting(true);

      const rentalPrice = parseFloat(newItem.rental_price);
      if (isNaN(rentalPrice) || rentalPrice <= 0) {
        throw new Error('Please enter a valid rental price');
      }

      const { error } = await supabase.from('clothing_items').insert({
        name: newItem.name,
        description: newItem.description || null,
        size: newItem.size,
        category: newItem.category,
        condition: newItem.condition,
        rental_price: rentalPrice,
        image_url: newItem.image_url || null,
        available: true
      });

      if (error) throw error;

      toast.success('Item added successfully!');
      await fetchInventory();
      return true;
    } catch (error: any) {
      toast.error('Error adding item: ' + error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = async (item: ClothingItem) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('clothing_items')
        .update({
          name: item.name,
          description: item.description,
          size: item.size,
          category: item.category,
          condition: item.condition,
          rental_price: item.rental_price,
          image_url: item.image_url
        })
        .eq('id', item.id);

      if (error) throw error;

      toast.success('Item updated successfully!');
      await fetchInventory();
      return true;
    } catch (error: any) {
      toast.error('Error updating item: ' + error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast.success('Item deleted successfully!');
      await fetchInventory();
      return true;
    } catch (error: any) {
      toast.error('Error deleting item: ' + error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page]);

  return {
    items,
    totalItems,
    isLoading,
    isSubmitting,
    addItem,
    updateItem,
    deleteItem
  };
}; 