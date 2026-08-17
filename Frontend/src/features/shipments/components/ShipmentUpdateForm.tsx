import { useForm } from '@mantine/form';
import { TextInput, Button, SimpleGrid, Group, Stack, Text, Divider, Box } from '@mantine/core';
import '@mantine/notifications/styles.css';
import { DateTimePicker } from '@mantine/dates';
import { Shipment, EventCategory, } from '@/features/shipments/types/Shipment';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { setupShipmentWatchers } from '../validation/ShipmentFormRules';
import EditableTextInput from '../../../components/Input/EditableTextInput';

import { ShipmentValidator } from '../validation/ShipmentValidator';
import { ShipmentModel } from '../domain/shipmentModel';
import { useFormNotifications } from '@/features/notfications/hooks/useNotifications';

import { useTranslation } from 'react-i18next';

import { notify } from '../../../components/utils/notifications';
interface EventFieldConfig {
  key: EventCategory;
  showNotes?: boolean;
  maxNotesLength?: number;
  notesLable?: string;
}

const EVENT_FIELDS: EventFieldConfig[] = [
  { key: "pick_up" },
  { key: "departure" },
  { key: "delay", showNotes: true, maxNotesLength: 50 },
  { key: "mex_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_mex" },
  { key: "usa_inspeccion", showNotes: true, maxNotesLength: 25 },
  { key: "clear_usa" },
  { key: "safety_yard", showNotes: true, maxNotesLength: 25 },
  { key: "deliver", showNotes: true, maxNotesLength: 25 },
];
const EXPECTED_CATEGORIES = EVENT_FIELDS.map(f => f.key)
export default function ShipmentUpdateForm({ onSubmit, initialShipment }: { onSubmit: (values: Shipment) => void, initialShipment?: Shipment }) {


  const { t, i18n } = useTranslation()
  const form = useForm<Shipment>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    initialValues: {
      id: initialShipment?.id || 0,
      tracking_number: initialShipment?.tracking_number || '',
      customer_tracking: initialShipment?.customer_tracking || '',
      cliente: initialShipment?.cliente || '',
      truck: initialShipment?.truck || '',
      vehicle_type: initialShipment?.vehicle_type || '',
      trailer: initialShipment?.trailer || '',
      origen: initialShipment?.origen || '',
      destino: initialShipment?.destino || '',
      type_operation: initialShipment?.type_operation || '',
      events: ShipmentModel.prepareInitialEvents(initialShipment?.events, EXPECTED_CATEGORIES)
    }, validate: (values) => {

      const validator = new ShipmentValidator(values);
      const eventErrors = validator.validateEventChronology() || {};
      return {

        cliente: validator.validateCliente(),
        customer_tracking: validator.validateCustomertracking(),
        tracking_number: validator.validateCustomertracking(),
        truck: validator.validateTruck(),
        origen: validator.validateOrigin(),
        destino: validator.validateDestination(),
        trailer: validator.validateTrailer(),
        type_operation: validator.validateTypeOperation(),
        ...eventErrors,
      };
    },
  });
  setupShipmentWatchers(form)



  useFormNotifications({
    errors: form.errors,
    prefix: 'events.',
    title: 'Error de Validacion en Evento'
  })


  const handeSubmit = (values: Shipment) => {
    if (!form.isDirty()) {
      notify.warning('No has realizado ninguna modificación en los datos o fechas.', 'Sin Cambios'); return;

    }
    if (!form.isDirty('events')) {

      notify.warning('No has realizado ninguna modificación en los las fechas', 'Sin Cambios'); return;

    }
    onSubmit(values)
  }

  return (
    <Box p="xs" >
      <form onSubmit={form.onSubmit((values) => handeSubmit(values))}>
        <Stack >

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            < EditableTextInput label={t('shipment.labels.trackinNumber')} formProps={form.getInputProps('tracking_number')} />
            < EditableTextInput label={t('shipment.labels.customer_tracking')} formProps={form.getInputProps('customer_tracking')} />
            < EditableTextInput label={t('shipment.labels.cliente')} formProps={form.getInputProps('cliente')} />
            < EditableTextInput label={t('shipment.labels.truck')} formProps={form.getInputProps('truck')} />
            < EditableTextInput label={t('shipment.labels.vehicle_type')} formProps={form.getInputProps('vehicle_type')} />
            < EditableTextInput label={t('shipment.labels.trailer')} formProps={form.getInputProps('trailer')} />
            < EditableTextInput label={t('shipment.labels.origen')} formProps={form.getInputProps('origen')} />
            < EditableTextInput label={t('shipment.labels.destination')} formProps={form.getInputProps('destino')} />
          </SimpleGrid>

          <Divider my="sm" />

          <Text fw={700} size="lg">Eventos de Logística / Transfer</Text>

          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="lg" maw={900}>
            {EVENT_FIELDS.map((field) => {
              const eventIndex = form.values.events.findIndex(e => e.category === field.key);
              if (eventIndex === -1) return null;
              return (
                <Stack key={field.key}>
                  <DateTimePicker
                    label={t(`shipment.labels.${field.key}`)}
                    timePickerProps={{
                      withDropdown: true,
                      popoverProps: { withinPortal: false },
                      format: '24h',
                    }}
                    placeholder={t('shipment.labels.dateTime')}
                    clearable
                    {...form.getInputProps(`events.${eventIndex}.dateTime`)}
                  />
                  {field.showNotes &&

                    (<TextInput
                      placeholder={t('shipment.labels.inspectionNote')}
                      size="xs"
                      maxLength={field.maxNotesLength || 50}
                      {...form.getInputProps(`events.${eventIndex}.notes`)}
                    />)
                  }
                </Stack>
              );
            })}
          </SimpleGrid>
          <Group justify="flex-end" mt="xl">
            <Button type="submit" color="dark">
              GUARDAR
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );

}