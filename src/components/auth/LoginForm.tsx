
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
        <CardDescription>
          {t('auth.enterEmailAndPassword')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">{t('auth.email')}</label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">{t('auth.password')}</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <a 
                href="/forgot-password" 
                className="text-sm text-purple-600 hover:underline"
              >
                {t('auth.forgot')}
              </a>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700" 
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('auth.login')}
          </Button>
          <div className="mt-4 text-center text-sm">
            {t('auth.dontHaveAccount')}{' '}
            <a href="/signup" className="text-purple-600 hover:underline">
              {t('auth.signup')}
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
