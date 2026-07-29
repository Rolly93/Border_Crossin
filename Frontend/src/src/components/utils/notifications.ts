import { notifications } from '@mantine/notifications';

export const notify = {
  warning: (message: string, title = 'Aviso') => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      autoClose: 4000,
    });
  },
  success: (message: string, title = 'Éxito') => {
    notifications.show({
      title,
      message,
      color: 'green',
      autoClose: 3000,
    });
  },
  error: (message: string, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'red',
      autoClose: 5000,
    });
  },
};