
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Stack, Select, Title, Paper } from '@mantine/core';
import { ShipmentFormProps } from '@/features/shipments/types/ShipmentFormProps';
import { setupShipmentWatchers } from '../validation/ShipmentFormRules';
import { ShipmentValidator } from '../validation/ShipmentValidator';

import { useTranslation } from 'react-i18next';


import { useFormNotifications } from '@/features/notfications/hooks/useNotifications';

export function ShipmentForm({ initialData, onSubmit, onCancel }: ShipmentFormProps) {
  const { t, i18n } = useTranslation()

  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: {
      tracking_number: initialData?.tracking_number || '',
      customer_tracking: initialData?.customer_tracking || '',
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
        customer_tracking: validator.validateCustomertracking(),
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
              label={t('shipment.labels.trackinNumber')}
              placeholder={t('shipment.placeholders.trackinNumber')}
              required
              {...form.getInputProps('tracking_number')}
            />
            <TextInput
              label={t('shipment.labels.customer_tracking')}
              required
              placeholder={t('shipment.placeholders.customer_tracking')}
              {...form.getInputProps('customer_tracking')}
            />

          </Group>

          <Group grow>
            <TextInput
              label={t('shipment.labels.cliente')}
              placeholder={t('shipment.placeholders.cliente')}
              required
              {...form.getInputProps('cliente')}
            />
            <Select
              label={t('shipment.labels.operation_type')}
              placeholder={t('shipment.placeholders.operation_type')}
              data={['Exportacion', 'Importacion']}
              required
              {...form.getInputProps('type_operation')}
            />
          </Group>

          <Group grow>
            <TextInput
              label={t('shipment.labels.truck')}
              required
              placeholder={t('shipment.placeholders.truck')}
              {...form.getInputProps('truck')}
            />
            <Select
              label={t('shipment.labels.vehicle_type')}
              required
              placeholder={t('shipment.placeholders.vehicle_type')}
              data={['Drya va', 'Truck']}

              {...form.getInputProps('vehicle_type')}
            />
            <TextInput
              label={t('shipment.labels.trailer')}
              required
              placeholder={t('shipment.placeholders.trailer')}
              {...form.getInputProps('trailer')}
            />

          </Group>


          <Group grow>
            <TextInput
              label={t('shipment.labels.origen')}
              required
              placeholder={t('shipment.placeholders.origen')}
              {...form.getInputProps('origen')}
            />
            <TextInput
              label={t('shipment.labels.destination')}
              required
              placeholder={t('shipment.placeholders.origen')}
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