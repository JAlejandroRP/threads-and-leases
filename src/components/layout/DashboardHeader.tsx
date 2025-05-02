
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';

const DashboardHeader = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      <div className="font-semibold text-xl">Rental Management</div>
      <div className="flex items-center space-x-2">
        <LanguageSwitcher />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleSignOut}
          title={t('auth.logout')}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
