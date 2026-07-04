
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Stack, Select, Title, Paper } from '@mantine/core';
import { ShipmentFormProps } from '@/types/Forms';

export function ShipmentForm({ initialData, onSubmit, onCancel }: ShipmentFormProps) {
  // 1. Initialize the Mantine form hook
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      trcking_Number: initialData?.trcking_Number || '',
      costumer_tracking: initialData?.costumer_tracking || '',
      cliente: initialData?.cliente || '',
      truck: initialData?.truck || '',
      vehicleType: initialData?.vehicleType || '',
      trailer: initialData?.trailer || '',
      orgien: initialData?.orgien || '',
      destino: initialData?.destino || '',

    },

    // 2. Add validation rules if needed
    validate: {
      trcking_Number: (value) => (value.length < 2 ? 'Tracking number is required' : null),
      cliente: (value) => (value.length < 2 ? 'Client name is required' : null),
    },
  });

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit((values) => onSubmit(values as any))}>
        <Stack gap="md">
          <Title order={3}>Shipment Information</Title>

          <Group grow>
            <TextInput
              label="Tracking Number"
              placeholder="e.g. TRK-12345"
              required
              {...form.getInputProps('trcking_Number')}
            />
            <TextInput
              label="Customer Tracking"
              placeholder="e.g. CUST-987"
              {...form.getInputProps('costumer_tracking')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Cliente"
              placeholder="Client Name"
              required
              {...form.getInputProps('cliente')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Truck"
              placeholder="Truck ID/Number"
              {...form.getInputProps('truck')}
            />
            <Select
              label="Vehicle Type"
              placeholder="e.g. Dry Van, Reefer"
              data={['Drya va', 'Truck']}
              {...form.getInputProps('vehicleType')}
            />
            <TextInput
              label="Trailer"
              placeholder="Trailer Number"
              {...form.getInputProps('trailer')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Origen"
              placeholder="Origin City"
              {...form.getInputProps('orgien')}
            />
            <TextInput
              label="Destino"
              placeholder="Destination City"
              {...form.getInputProps('destino')}
            />
          </Group>


          <Group justify="end" mt="xl">
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              Save Shipment
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}