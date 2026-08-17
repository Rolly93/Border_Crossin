import { SimpleGrid } from "@mantine/core";
import {
  IconBuilding,
  IconCheck,
  IconMail,
  IconFileText,
} from "@tabler/icons-react";
import ActionCard from "../../../components/ui/ActionCard";
import { ICliente } from "@/features/clients/types/Cliente";

interface ClientMetricsProps {
  clients: ICliente[];
}

export function ClientMetrics({ clients }: ClientMetricsProps) {
  const totalClient = clients.length;
  const clientesActivos = clients.filter((c) => c.estatus).length;
  const sftActivos = clients.filter((c) => c.estatus && c.sftService).length;
  const emaiActivos = clients.filter((c) => c.estatus && c.emailService).length;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <ActionCard
        title="Clientes Activos"
        icon={<IconBuilding size={20} />}
        color=""
        statusText="Clientes"
        metric={totalClient}
        metricLabel="Total de Clientes registrados"
      />

      <ActionCard
        title="Activos"
        icon={<IconCheck size={20} />}
        color="teal"
        statusText="Clientes Activos"
        metric={clientesActivos}
        metricLabel="Activos"
      />

      <ActionCard
        title="Email Notification"
        icon={<IconMail size={20} />}
        color="yellow"
        statusText="con Servicio de alertas Email"
        metric={emaiActivos}
        metricLabel="Activos"
      />

      <ActionCard
        title="SFTP Notification"
        icon={<IconFileText size={20} />}
        color="grape"
        statusText="con conexion SFTP"
        metric={sftActivos}
        metricLabel="Activos"
      />
    </SimpleGrid>
  );
}