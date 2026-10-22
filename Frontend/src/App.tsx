import '@mantine/core/styles.css';
import { Router } from './Router';
import { Notifications } from '@mantine/notifications';

export default function App() {
  return (
    <>
      <Notifications />
      <Router />
    </>
  );
}