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
    password: ''
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
      login(data.token);
      navigate('/');
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
    setError('')
    setLoading(true)

    try {
      const data = await AuthtenticationService.signIn(employeeData)
    } catch (error) {

    }
  }

  return {

    error,
    loading,
    signIn,
    Login, userData, setUserData, setError
  };
}