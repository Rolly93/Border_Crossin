import { useForm } from '@mantine/form';
import { TextInput, Button, SimpleGrid, Group, Stack, Text, Divider, Box } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates'; // Use DateTimePicker since your type is 'dateTime'
import { Shipment, EventCategory, ShipmentEvent } from '@/types/Shipment';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
interface EventFieldConfig{
    key:EventCategory;
    label:string
}
      const EVENT_FIELDS :EventFieldConfig[] =[
        {key: "pick_up",  label:'Pick up' },
        {key: "departure" , label: 'Departure'},
        {key: "delay", label: 'Delay'},
        {key: "clear_mex",  label: 'Clear Customs Mex' },
        {key: "mex_inspeccion",  label:'Mex Inspection' },
        {key: "usa_inspeccion" , label: 'USa Inspection'},
        {key: "clear_usa", label: 'Clear Sutoms USA'},
        {key:"safety_yard",  label: 'Safety Yard'},
        {key: "deliver" ,label: 'Delivered'},
      ];      
export default  function ShipmentUpdateForm ({ onSubmit, initialShipment }: { onSubmit: (values: Shipment) => void, initialShipment?: Shipment }) 
{
    const prepareInitialEvents = (existingEvent : ShipmentEvent[] = []):ShipmentEvent[]=>{
        return EVENT_FIELDS.map(field =>{
            const found = existingEvent.find(e=>e.category ===field.key);
            return found|| {category: field.key , dateTime : null as any , notes:''}

        })

    }

    const form = useForm<Shipment>({
        mode: 'controlled',
        initialValues: {
          id: initialShipment?.id || 0,
          trcking_Number: initialShipment?.trcking_Number || '',
          costumer_tracking: initialShipment?.costumer_tracking || '',
          cliente: initialShipment?.cliente || '',
          truck: initialShipment?.truck || '',
          vehicleType: initialShipment?.vehicleType || '',
          trailer: initialShipment?.trailer || '',
          orgien: initialShipment?.orgien || '',
          destino: initialShipment?.destino || '',
          type_operation:initialShipment?.type_operation|| '',
          status: initialShipment?.status || '',
          events: prepareInitialEvents(initialShipment?.events), // Ensures all slots exist
        },
      });
return (
    <Box p="xs" >
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Stack >
          
          {/* --- TOP SECTION: General Shipment Info --- */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            <TextInput label="Embarque" {...form.getInputProps('trcking_Number')} />
            <TextInput label="Cliente" {...form.getInputProps('cliente')} />
            <TextInput label="No. Vehiculo" {...form.getInputProps('truck')} />
            <TextInput label="Tipo Vehículo" {...form.getInputProps('vehicleType')} />
            <TextInput label="Trailer" {...form.getInputProps('trailer')} />
            <TextInput label="Origen" {...form.getInputProps('orgien')} />
            <TextInput label="Destino" {...form.getInputProps('destino')} />
            <TextInput label="Estatus" {...form.getInputProps('status')} />
          </SimpleGrid>

          <Divider my="sm" />

          {/* --- BOTTOM SECTION: Logistics Events Layout --- */}
          <Text fw={700} size="lg">Eventos de Logística / Transfer</Text>
          
          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="lg">
            {EVENT_FIELDS.map((field) => {
              // Find the index of this event in Mantine's form array state
              const eventIndex = form.values.events.findIndex(e => e.category === field.key);
              if (eventIndex === -1) return null;
              return (
                <Stack  key={field.key}>
                  {/* Date Input for the event */}
                  <DateTimePicker
                    label={field.label}
                    timePickerProps={{
                    withDropdown: true,
                    popoverProps: { withinPortal: false },
                    format: '24h',
                  }}                    placeholder="Seleccionar Fecha y Hora..."
                  clearable
                  {...form.getInputProps(`events.${eventIndex}.dateTime`)}
                  />
                  {/* Optional: You can add an accompanying notes field underneath each, or just leave the date */}
                  <TextInput 
                    placeholder="Notas opcionales" 
                    size="xs"
                    {...form.getInputProps(`events.${eventIndex}.notes`)}
                  />
                </Stack>
              );
            })}
          </SimpleGrid>

          {/* --- ACTION BUTTONS --- */}
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