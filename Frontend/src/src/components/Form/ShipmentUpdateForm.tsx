import { useForm } from '@mantine/form';
import { TextInput, Button, SimpleGrid, Group, Stack, Text, Divider, Box } from '@mantine/core';
import '@mantine/notifications/styles.css';
import { DateTimePicker } from '@mantine/dates'; 
import { Shipment, EventCategory, } from '@/types/Shipment';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { setupShipmentWatchers } from '../utils/validation/ShipmentFormRules';
import EditableTextInput from '../Input/EditableTextInput';

import { ShipmentValidator } from '../utils/validation/ShipmentValidator';
import { ShipmentModel } from '../utils/domain/shipmentModel';
import { useFormNotifications } from '@/hooks/useNotifications';

import { notify } from '../utils/notifications';
interface EventFieldConfig{
    key:EventCategory;
    label:string
    showNotes?:boolean;
    maxNotesLength?:number;
    notesLable?:string;
}
const EVENT_FIELDS :EventFieldConfig[] =[
  {key: "pick_up",  label:'Pick up' },
  {key: "departure" , label: 'Departure'},
  {key: "delay", label: 'Delay' , showNotes:true, maxNotesLength:50, notesLable:"Delay for"},
  {key: "mex_inspeccion",  label:'Mex Inspection' , showNotes:true , maxNotesLength:25 ,  notesLable:"New Seal"},
  {key: "clear_mex",  label: 'Clear Customs Mex' },
  {key: "usa_inspeccion" , label: 'USa Inspection' , showNotes:true , maxNotesLength:25 , notesLable:"New Seal"},
  {key: "clear_usa", label: 'Clear Sutoms USA'},
  {key:"safety_yard",  label: 'Safety Yard' , showNotes:true , maxNotesLength:25 , notesLable:"safeted at"},
  {key: "deliver" ,label: 'Delivered' ,showNotes:true , maxNotesLength:25 , notesLable:"Who recives the shipment"},
];      
const EXPECTED_CATEGORIES = EVENT_FIELDS.map(f=>f.key)
export default  function ShipmentUpdateForm ({ onSubmit, initialShipment }: { onSubmit: (values: Shipment) => void, initialShipment?: Shipment }) 
{




    const form = useForm<Shipment>({
        mode: 'uncontrolled',
        validateInputOnChange:true,
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
          events: ShipmentModel.prepareInitialEvents(initialShipment?.events, EXPECTED_CATEGORIES)
        }, validate:(values)=> {

          const validator = new ShipmentValidator(values);
          const eventErrors = validator.validateEventChronology()||{};
          return {
            
      cliente:validator.validateCliente(),
      costumer_tracking:validator.validateCustomertracking(),
      trcking_Number:validator.validateCustomertracking(),
      truck:validator.validateTruck(),
      orgien:validator.validateOrigin(),
      destino:validator.validateDestination(),
      trailer:validator.validateTrailer(),
      type_operation :validator.validateTypeOperation(),
      ...eventErrors,
    };},
      });
      setupShipmentWatchers(form)



useFormNotifications({
  errors:form.errors,
  prefix:'events.',
  title:'Error de Validacion en Evento'})


const handeSubmit =(values: Shipment) =>{
  if (!form.isDirty()){
notify.warning('No has realizado ninguna modificación en los datos o fechas.', 'Sin Cambios');    return;

  }
  if(!form.isDirty('events')){

notify.warning('No has realizado ninguna modificación en los las fechas', 'Sin Cambios');    return;

    }
onSubmit(values)
}

return (
    <Box p="xs" >
      <form onSubmit={form.onSubmit((values) => handeSubmit(values))}>
        <Stack >

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
            < EditableTextInput  label="No. Embarque" formProps= {form.getInputProps('trcking_Number')} />
            < EditableTextInput  label="Referencia" formProps={form.getInputProps('costumer_tracking')} />
            < EditableTextInput  label="Cliente" formProps={form.getInputProps('cliente')} />
            < EditableTextInput  label="No. Vehiculo" formProps={form.getInputProps('truck')} />
            < EditableTextInput  label="Tipo Vehículo" formProps={form.getInputProps('vehicleType')} />
            < EditableTextInput  label="Trailer" formProps={form.getInputProps('trailer')} />
            < EditableTextInput  label="Origen" formProps={form.getInputProps('orgien')} />
            < EditableTextInput  label="Destino" formProps={form.getInputProps('destino')} />
          </SimpleGrid>

          <Divider my="sm" />

          <Text fw={700} size="lg">Eventos de Logística / Transfer</Text>
          
          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="lg" maw={900}>
            {EVENT_FIELDS.map((field) => {
              const eventIndex = form.values.events.findIndex(e => e.category === field.key);
              if (eventIndex === -1) return null;
              return (
                <Stack  key={field.key}>
                  <DateTimePicker
                    label={field.label}
                    timePickerProps={{
                    withDropdown: true,
                    popoverProps: { withinPortal: false },
                    format: '24h',
                  }}
                  placeholder="Seleccionar Fecha y Hora..."
                  clearable
                  {...form.getInputProps(`events.${eventIndex}.dateTime`)}
                  />
                  {field.showNotes &&
                  
                  (<TextInput 
                    placeholder={field.notesLable}
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