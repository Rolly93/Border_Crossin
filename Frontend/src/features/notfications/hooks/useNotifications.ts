import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';

interface UseFormNotificationsProps {
  errors: Record<string, any>;
  prefix?: string;
  title?: string;
}

export function useFormNotifications({
  errors,
  prefix = '',
  title = 'Error de Validación'
}: UseFormNotificationsProps) {

  const serializedErrors = JSON.stringify(errors);

  useEffect(() => {
    const activeErrors = Object.entries(errors)
      .filter(([key, value]) => key.startsWith(prefix) && typeof value === 'string')
      .map(([_, value]) => value as string);

    if (activeErrors.length > 0) {
      activeErrors.forEach((error) => {
        notifications.show({
          title,
          message: error,
          color: 'red',
        });
      });
    }
  }, [serializedErrors, prefix, title]);
}