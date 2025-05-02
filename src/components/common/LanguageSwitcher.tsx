
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Store the language preference in localStorage
    localStorage.setItem('language', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? "bg-gray-100" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('es')}
          className={i18n.language === 'es' ? "bg-gray-100" : ""}
        >
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
