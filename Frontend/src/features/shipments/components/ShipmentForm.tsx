
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Stack, Select, Title, Paper } from '@mantine/core';
import { ShipmentFormProps } from '@/features/shipments/types/ShipmentFormProps';
import { setupShipmentWatchers } from '../validation/ShipmentFormRules';
import { ShipmentValidator } from '../validation/ShipmentValidator';
import { useTranslation } from 'react-i18next';
import { useClients } from '@/features/clients/hooks/useClients';
import { notifications } from '@mantine/notifications';
import { ValidateClientReference } from '@/components/utils/businessRules';

export function ShipmentForm({ initialData, onSubmit, onCancel }: ShipmentFormProps) {
  const { clientsName } = useClients()
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






  const handleValidationError = (errors: typeof form.errors) => {
    notifications.show({
      title: 'Error de Datos',
      message: 'Por favor revisa los campos marcados en rojo antes de continuar.',
      color: 'red',
    });
  };


  const handleSubmit = async (values: typeof form.values) => {
    try {
      const selectedClient = clientsName.find((c) => c.id === Number(values.cliente));
      const clientName = selectedClient?.name || '';

      const { isValid, field, error } = ValidateClientReference({
        onClientName: clientName,
        onReferenceClient: values.customer_tracking,
        onTypeOperation: values.type_operation,
      });

      if (!isValid && field && error) {
        form.setFieldError(field, error);
        return;
      }

      await onSubmit(values);

    } catch (err: any) {
      if (typeof err === 'object' && !err.message) {
        form.setErrors(err);
      } else if (err.message) {
        form.setFieldError('customer_tracking', err.message);
      }
    }
  };

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit((values) => handleSubmit(values as any), handleValidationError)}>
        <Stack gap="md">
          <Title order={3}>Shipment Information</Title>

          <Group grow>
            <TextInput
              label={t('shipment.labels.trackingNumber')}
              placeholder={t('shipment.placeholders.trackingNumber')}
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
            <Select
              label={t('shipment.labels.cliente')}
              placeholder={t('shipment.placeholders.cliente')}
              data={clientsName.map((client) => ({
                value: client.id,
                label: client.name,
              }))}
              autoSelectOnBlur
              searchable
              required
              {...form.getInputProps('cliente')}
            />
            <Select
              label={t('shipment.labels.operation_type')}
              placeholder={t('shipment.placeholders.operation_type')}
              data={['Exportacion', 'Importacion']}
              autoSelectOnBlur
              searchable
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