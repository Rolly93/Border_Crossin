
export const setupShipmentWatchers = (form: any) => {
form.watch('cliente', () => form.validateField('costumer_tracking'));
form.watch('costumer_tracking', () => form.validateField('costumer_tracking'));
form.watch('trcking_Number' , ()=> form.validateField('trcking_Number'));
};