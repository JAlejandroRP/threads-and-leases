
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string
          address: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone: string
          address?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string
          address?: string | null
          user_id?: string
        }
      }
      clothing_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          size: string
          category: string
          condition: string
          rental_price: number
          available: boolean
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          size: string
          category: string
          condition: string
          rental_price: number
          available?: boolean
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          size?: string
          category?: string
          condition?: string
          rental_price?: number
          available?: boolean
          image_url?: string | null
        }
      }
      rentals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_id: string
          clothing_item_id: string
          start_date: string
          end_date: string
          status: 'active' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id: string
          clothing_item_id: string
          start_date: string
          end_date: string
          status?: 'active' | 'completed' | 'cancelled'
          notes?: string | null
          total_price: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id?: string
          clothing_item_id?: string
          start_date?: string
          end_date?: string
          status?: 'active' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
