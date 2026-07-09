import { useForm } from '@mantine/form';
import { TextInput, Button, SimpleGrid, Group, Stack, Text, Divider, Box } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates'; // Use DateTimePicker since your type is 'dateTime'
import { Shipment, EventCategory, ShipmentEvent } from '@/types/Shipment';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { setupShipmentWatchers } from '../utils/validation/ShipmentFormRules';
import { useState } from 'react';
import EditableTextInput from '../Input/EditableTextInput';

import { ShipmentValidator } from '../utils/validation/ShipmentValidator';
import { ShipmentModel } from '../utils/domain/shipmentModel';
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
  {key: "clear_mex",  label: 'Clear Customs Mex' },
  {key: "mex_inspeccion",  label:'Mex Inspection' , showNotes:true , maxNotesLength:25 ,  notesLable:"New Seal"},
  {key: "usa_inspeccion" , label: 'USa Inspection' , showNotes:true , maxNotesLength:25 , notesLable:"New Seal"},
  {key: "clear_usa", label: 'Clear Sutoms USA'},
  {key:"safety_yard",  label: 'Safety Yard' , showNotes:true , maxNotesLength:25 , notesLable:"safeted at"},
  {key: "deliver" ,label: 'Delivered' ,showNotes:true , maxNotesLength:25 , notesLable:"Who recives the shipment"},
];      
const EXPECTED_CATEGORIES = EVENT_FIELDS.map(f=>f.key)
export default  function ShipmentUpdateForm ({ onSubmit, initialShipment }: { onSubmit: (values: Shipment) => void, initialShipment?: Shipment }) 
{
  const [itEditid ,setIsEdit] = useState(false);




    const form = useForm<Shipment>({
        mode: 'controlled',
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
          status: initialShipment?.status || '',
          events: ShipmentModel.prepareInitialEvents(initialShipment?.events, EXPECTED_CATEGORIES)
        }, validate:{
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
    <Box p="xs" >
      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
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
            < EditableTextInput  label="Estatus" formProps={form.getInputProps('status')} />
          </SimpleGrid>

          <Divider my="sm" />

          <Text fw={700} size="lg">Eventos de Logística / Transfer</Text>
          
          <SimpleGrid cols={{ base: 2, sm: 2, md: 3 }} spacing="lg">
            {EVENT_FIELDS.map((field) => {
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