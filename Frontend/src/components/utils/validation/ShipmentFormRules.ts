import { validateCostumerTracking ,validClient} from './shipmentValidation';

export const shipmentValidationRules = {
  costumer_tracking: (value: any, values: any) => validateCostumerTracking(value, values as any),
  cliente: (value: string) => (value.trim().length < 2 ? 'Client name is required' : null),
  trcking_Number: (value: string) => (value.trim().length < 5 ? 'No. Embarque Invalid' : null),
  truck: (value: string) => (value.trim().length < 2 ? 'Truck unit Invalid' : null),
  orgien: (value: string) => (value.trim().length < 5 ? 'Origen unit Invalid' : null),
  destino: (value: string) => (value.trim().length < 3 ? 'Destination unit Invalid' : null),
  trailer: (value: string) => (value.trim().length < 3 ? 'Trailer unit Invalid' : null),
};

export const setupShipmentWatchers = (form: any) => {
form.watch('cliente', () => form.validateField('costumer_tracking'));
form.watch('costumer_tracking', () => form.validateField('costumer_tracking'));
form.watch('trcking_Number' , ()=> form.validateField('trcking_Number'));
};