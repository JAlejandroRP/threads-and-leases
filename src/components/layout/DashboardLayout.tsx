
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Rentals', path: '/rentals', icon: '📝' },
    { name: 'Inventory', path: '/inventory', icon: '👔' },
    { name: 'Customers', path: '/customers', icon: '👥' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Attire Rental</h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="text-sm"
            >
              Sign out
            </Button>
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-2">
            <div className="px-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="block w-full text-left py-2 px-3 rounded-md hover:bg-gray-100"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </button>
              ))}
              <hr className="my-2" />
              <div className="py-2 px-3 text-sm text-gray-700">{user?.email}</div>
              <button
                onClick={() => signOut()}
                className="block w-full text-left py-2 px-3 text-red-600 hover:bg-red-50 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-grow">
        {/* Sidebar - desktop only */}
        <div className="hidden md:block w-64 bg-white shadow-sm">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center w-full py-2 px-3 rounded-md hover:bg-gray-100 text-left"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
