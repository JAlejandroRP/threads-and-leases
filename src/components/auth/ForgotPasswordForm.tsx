
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error(error.message);
      } else {
        setIsSent(true);
        toast.success('Reset password link sent to your email!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      {!isSent ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending link...' : 'Send reset link'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Remember your password?{' '}
              <a href="/login" className="text-purple-600 hover:underline">
                Back to login
              </a>
            </div>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="text-center">
          <p className="mb-4">
            Check your email for a link to reset your password.
          </p>
          <a href="/login" className="text-purple-600 hover:underline">
            Back to login
          </a>
        </CardContent>
      )}
    </Card>
  );
};

export default ForgotPasswordForm;
