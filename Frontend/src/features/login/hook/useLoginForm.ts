import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthenticationService } from '../service/LoginService';
import { TSignInPayload, TSingIn } from '../type/ILoginService';
import { components } from '@/types/api';


export type TLoginRequest = components['schemas']['LoginRequest']
export type TLoginResponse = components['schemas']['LoginResponse']
export type TNewUserRequest = components['schemas']['NewUser']
export type TNewUserResponse = components['schemas']['NewUserResponse']

export function useLoginForm() {
  const [userData, setUserData] = useState<TSingIn>({
    email: '',
    username: '',
    password: '',
    role: '',
    isAdmin: false,
  })
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const Login = async (credencials: TLoginRequest) => {
    setError('');
    setLoading(true);
    try {

      const data = await AuthenticationService.login(credencials);

      login(data.access_token);
      navigate('/');
      return data
    } catch (err: any) {
      const errorMessage =

        err.message ||
        'Invalid email or password';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (employeeData: TSignInPayload) => {
    setError('');
    setLoading(true);

    try {
      const data = await AuthenticationService.signIn(employeeData);

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
