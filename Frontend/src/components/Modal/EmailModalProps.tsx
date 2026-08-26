import { Drawer } from "@mantine/core";

interface IEmailModalProps {
    opened: boolean;
    onClose: () => void;
}
export default function SftModal({ opened, onClose }: IEmailModalProps) {    return ( 
<Drawer offset={8} radius="md" opened={opened} onClose={onClose}>

    </Drawer>)
}