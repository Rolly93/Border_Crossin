
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Stack, Select, Title, Paper } from '@mantine/core';
import { ShipmentFormProps } from '@/types/Forms';
import { setupShipmentWatchers } from '../utils/validation/ShipmentFormRules';
import { ShipmentValidator } from '../utils/validation/ShipmentValidator';

import { useFormNotifications } from '@/hooks/useNotifications';

export function ShipmentForm({ initialData, onSubmit, onCancel }: ShipmentFormProps) {
  // 1. Initialize the Mantine form hook
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: {
      tracking_number: initialData?.tracking_number || '',
      costumer_tracking: initialData?.costumer_tracking || '',
      type_operation: initialData?.type_operation || 'Exportacion',
      cliente: initialData?.cliente || '',
      truck: initialData?.truck || '',
      vehicle_type: initialData?.vehicle_type || '',
      trailer: initialData?.trailer || '',
      origen: initialData?.origen || '',
      destino: initialData?.destino || '',

    },

    validate: (values) => {
      const validator = new ShipmentValidator(values);

      return {
        cliente: validator.validateCliente(),
        costumer_tracking: validator.validateCustomertracking(),
        tracking_number: validator.validateTrackingNumber(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destino: validator.validateDestination(),
        trailer: validator.validateTrailer(),
        type_operation: validator.validateTypeOperation(),
      }
    }

  });

  setupShipmentWatchers(form)

  useFormNotifications({
    errors: form.errors,
    title: 'Error de Datos'
  })



  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit((values) => onSubmit(values as any))}>
        <Stack gap="md">
          <Title order={3}>Shipment Information</Title>

          <Group grow>
            <TextInput
              label="No. Embarque"
              placeholder="e.g. TRK-12345"
              required
              {...form.getInputProps('tracking_number')}
            />
            <TextInput
              label="Referencia"
              required
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
            <Select
              label="Tipo Operacion"
              placeholder="Exportacion / Importacion ....."
              data={['Exportacion', 'Importacion']}
              required
              {...form.getInputProps('type_operation')}
            />
          </Group>

          <Group grow>
            <TextInput
              label="Tractor"
              required
              placeholder="Truck ID/Number"
              {...form.getInputProps('truck')}
            />
            <Select
              label="Vehicle Type"
              required
              placeholder="e.g. Dry Van, Reefer"
              data={['Drya va', 'Truck']}

              {...form.getInputProps('vehicle_type')}
            />
            <TextInput
              label="Trailer"
              required
              placeholder="Trailer Number"
              {...form.getInputProps('trailer')}
            />

          </Group>


          <Group grow>
            <TextInput
              label="Origen"
              required
              placeholder="Origin yard"
              {...form.getInputProps('origen')}
            />
            <TextInput
              label="Destino"
              required
              placeholder="Destination yard"
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