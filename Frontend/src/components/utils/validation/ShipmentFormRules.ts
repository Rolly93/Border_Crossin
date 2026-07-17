
export const setupShipmentWatchers = (form: any) => {
form.watch('cliente', () => form.validateField('cliente'));
form.watch('costumer_tracking', () => form.validateField('costumer_tracking'));
form.watch('trcking_Number' , ()=> form.validateField('trcking_Number'));
form.watch('events',()=>{
    form.values.events.forEach((_:any,index:number)=>{
        form.validateField(`events.${index}.dateTime`);
    })
})
};
