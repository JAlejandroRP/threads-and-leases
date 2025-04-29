
import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/lib/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  useRequireAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalInventory: 0,
    totalCustomers: 0,
    rentalsThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get active rentals count
        const { count: activeRentals } = await supabase
          .from('rentals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        
        // Get inventory count
        const { count: totalInventory } = await supabase
          .from('clothing_items')
          .select('*', { count: 'exact', head: true });
          
        // Get customers count
        const { count: totalCustomers } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        
        // Get rentals this month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count: rentalsThisMonth } = await supabase
          .from('rentals')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth);
          
        setStats({
          activeRentals: activeRentals || 0,
          totalInventory: totalInventory || 0,
          totalCustomers: totalCustomers || 0,
          rentalsThisMonth: rentalsThisMonth || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate('/rentals/new')}
          >
            Create New Rental
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Active Rentals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeRentals}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Currently rented items
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalInventory}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Available clothing items
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Registered customer profiles
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  New Rentals This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.rentalsThisMonth}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Rentals created this month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-40"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Recent activity will appear here.</p>
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/rentals')}
                    className="mt-2 text-purple-600"
                  >
                    View all rentals
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
