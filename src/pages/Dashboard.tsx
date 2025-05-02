import { useState, useEffect } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const Dashboard = () => {
  useRequireAuth();
  const navigate = useNavigate();
  
  const [totalRentals, setTotalRentals] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [completedRentals, setCompletedRentals] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [rentalStatusData, setRentalStatusData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Total Rentals
      const { count: rentalsCount, error: rentalsError } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true });
      if (rentalsError) throw rentalsError;
      setTotalRentals(rentalsCount || 0);

      // Active Rentals
      const { count: activeCount, error: activeError } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      if (activeError) throw activeError;
      setActiveRentals(activeCount || 0);

      // Completed Rentals
      const { count: completedCount, error: completedError } = await supabase
        .from('rentals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      if (completedError) throw completedError;
      setCompletedRentals(completedCount || 0);

      // Total Revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('rentals')
        .select('total_price');
      if (revenueError) throw revenueError;
      const total = revenueData?.reduce((acc, rental) => acc + rental.total_price, 0) || 0;
      setTotalRevenue(total);

      // Monthly Revenue
      const { data: monthlyData, error: monthlyError } = await supabase.rpc('get_monthly_revenue');
      if (monthlyError) throw monthlyError;
      setMonthlyRevenue(monthlyData || []);

      // Rental Status Data for Pie Chart
      const { data: statusData, error: statusError } = await supabase.rpc('get_rental_status_counts');
      if (statusError) throw statusError;
      setRentalStatusData(statusData || []);

      // Top Customers
      const { data: customerData, error: customerError } = await supabase.rpc('get_top_customers');
      if (customerError) throw customerError;
      setTopCustomers(customerData || []);

      // Popular Items
      const { data: itemsData, error: itemsError } = await supabase.rpc('get_popular_items');
      if (itemsError) throw itemsError;
      setTopItems(itemsData || []);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix for the TS error: Accessing properties correctly on array items
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => fetchDashboardData()}>Refresh Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRentals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRentals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRentals}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  isAnimationActive={false}
                  data={rentalStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {rentalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{customer.name}</span>
                      <span className="text-sm text-gray-500">{customer.count} rentals</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No customer data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              {topItems.length > 0 ? (
                <div className="space-y-4">
                  {topItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.count} rentals</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No item data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
