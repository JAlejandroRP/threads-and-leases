export interface Rental {
  id: string;
  created_at: string;
  customer_id: string;
  clothing_item_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending_adjustment' | 'pending_creation' | 'ready';
  total_price: number;
  return_notes?: string | null;
  return_condition?: string | null;
  additional_fees?: number | null;
  customer: {
    name: string;
  };
  clothing_item: {
    name: string;
    size: string;
  };
  rental_items?: RentalItem[];
}

export interface RentalItem {
  id: string;
  rental_id: string;
  clothing_item_id: string;
  price: number;
  clothing_item: {
    name: string;
    size: string;
  };
} 