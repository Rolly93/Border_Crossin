import { Center, Loader } from '@mantine/core';

export function Loading() {
  return (
    <Center style={{ height: '100vh' }}>
      <Loader size="lg" color="blue" />
    </Center>
  );
}