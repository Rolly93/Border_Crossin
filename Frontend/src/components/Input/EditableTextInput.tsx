import { CheckIcon, TextInput } from "@mantine/core";
import { useState } from "react";

interface EditableTextInputsProps {
    label:string;
    placeholder?:string;
    formProps:any;
}

export default function EditableTextInput({label,placeholder,formProps}:EditableTextInputsProps){
const [isEditing , setIsediting] = useState(false)

return(<TextInput label={label}
    {...formProps} 
    placeholder={placeholder}
    readOnly={!isEditing}
    onDoubleClick={()=>setIsediting(true)}
    onBlur={(event) => {
        // Ejecuta el onBlur original de Mantine si existe para que no se rompa la validación
        if (formProps?.onBlur) formProps.onBlur(event);
        // Apaga nuestro modo de edición
        setIsediting(false);
      }}
    rightSection={isEditing?(
        <CheckIcon size={14} color="blue" />
    ):(
            <CheckIcon size={14} color="green" style={{opacity:0.03}} />    
    )}
    />
)
}