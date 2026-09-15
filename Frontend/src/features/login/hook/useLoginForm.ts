import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthtenticationService } from '../service/LoginService';
import { ISignIn, LoginCredentials } from '../type/ILoginService';

export function useLoginForm() {
  const [userData, setUserData] = useState<ISignIn>({
    email: '',
    isAdmin: false,
    role: '',
    username: '',
    password: '',
  })
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const Login = async (credencials: LoginCredentials) => {
    setError('');
    setLoading(true);
    try {

      const data = await AuthtenticationService.login(credencials);

      login(data.access_token);
      navigate('/');
      return data
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (employeeData: ISignIn) => {
    setError('');
    setLoading(true);

    try {
      const data = await AuthtenticationService.signIn(employeeData);

      return data;
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      let errorMessage = 'Failed to sign in';

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        errorMessage = detail.map((e: any) => `${e.loc?.[1] || 'Field'}: ${e.msg}`).join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return {

    error,
    loading,
    signIn,
    Login, userData, setUserData, setError
  };
}