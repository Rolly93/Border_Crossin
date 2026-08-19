
export const setupShipmentWatchers = (form: any) => {
    form.watch('cliente', () => form.validateField('cliente'));
    form.watch('customer_tracking', () => form.validateField('customer_tracking'));
    form.watch('tracking_number', () => form.validateField('tracking_number'));
    form.watch('events', () => {
        form.values.events.forEach((_: any, index: number) => {
            form.validateField(`events.${index}.dateTime`);
        })
    })
};
