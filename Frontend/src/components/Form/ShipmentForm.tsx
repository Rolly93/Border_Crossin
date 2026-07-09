
import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Stack, Select, Title, Paper } from '@mantine/core';
import { ShipmentFormProps } from '@/types/Forms';
import {setupShipmentWatchers} from '../utils/validation/ShipmentFormRules';
import { ShipmentValidator } from '../utils/validation/ShipmentValidator';

export function ShipmentForm({ initialData, onSubmit, onCancel }: ShipmentFormProps) {
  // 1. Initialize the Mantine form hook
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange:true,
    initialValues: {
      trcking_Number: initialData?.trcking_Number || '',
      costumer_tracking: initialData?.costumer_tracking || '',
      type_operation:initialData?.type_operation||'Exportacion',
      cliente: initialData?.cliente || '',
      truck: initialData?.truck || '',
      vehicleType: initialData?.vehicleType || '',
      trailer: initialData?.trailer || '',
      orgien: initialData?.orgien || '',
      destino: initialData?.destino || '',

    },

    validate:{
      cliente:(_value ,values)=>new ShipmentValidator(values).validateCliente(),
      costumer_tracking:(_value ,values)=>new ShipmentValidator(values).validateCustomertracking(),
      trcking_Number:(_value ,values)=>new ShipmentValidator(values).validateCustomertracking(),
      truck:(_value ,values)=>new ShipmentValidator(values).validateTruck(),
      orgien:(_value ,values)=>new ShipmentValidator(values).validateOrigin(),
      destino:(_value ,values)=>new ShipmentValidator(values).validateDestination(),
      trailer:(_value ,values)=>new ShipmentValidator(values).validateTrailer(),
      type_operation : (_value, values) => new ShipmentValidator(values).validateTypeOperation(),

    },
  });

setupShipmentWatchers(form)



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
              {...form.getInputProps('trcking_Number')}
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
              data={[ 'Exportacion', 'Importacion']}
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
              
              {...form.getInputProps('vehicleType')}
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
              {...form.getInputProps('orgien')}
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