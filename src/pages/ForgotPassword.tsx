
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import { useRedirectAuthenticated } from '@/lib/auth';

const ForgotPasswordPage = () => {
  useRedirectAuthenticated();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attire Rental</h1>
          <p className="text-gray-600">Clothing Rental Management System</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
