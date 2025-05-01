import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
}

export interface CustomerService {
  getCustomers: (from: number, to: number) => Promise<{ data: Customer[]; count: number }>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
}

export class SupabaseCustomerService implements CustomerService {
  async getCustomers(from: number, to: number) {
    try {
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;

      // Fetch paginated customers
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')
        .range(from, to);

      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0
      };
    } catch (error: any) {
      toast.error('Error loading customers: ' + error.message);
      throw error;
    }
  }

  async addCustomer(customer: Omit<Customer, 'id' | 'created_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add a customer');
      }

      const { error } = await supabase.from('customers').insert({
        ...customer,
        user_id: user.id
      });

      if (error) throw error;
      toast.success('Customer added successfully!');
    } catch (error: any) {
      toast.error('Error adding customer: ' + error.message);
      throw error;
    }
  }
} 