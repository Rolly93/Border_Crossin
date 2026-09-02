import { SimpleGrid } from "@mantine/core";
import {
  IconBuilding,
  IconCheck,
  IconMail,
  IconFileText,
} from "@tabler/icons-react";
import ActionCard from "../../../components/ui/ActionCard";
import { ClientMetricsResponse } from "../types/IClientService";

interface ClientMetricsProps {
  onMetrics: ClientMetricsResponse;
}


export function ClientMetrics({ onMetrics }: ClientMetricsProps) {

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      <ActionCard
        title="Clientes Activos"
        icon={<IconBuilding size={20} />}
        color=""
        statusText="Clientes"
        metric={onMetrics.totalClients}
        metricLabel="Total de Clientes registrados"
      />

      <ActionCard
        title="Activos"
        icon={<IconCheck size={20} />}
        color="teal"
        statusText="Clientes Activos"
        metric={onMetrics.activeClient}
        metricLabel="Activos"
      />

      <ActionCard
        title="Email Notification"
        icon={<IconMail size={20} />}
        color="yellow"
        statusText="con Servicio de alertas Email"
        metric={onMetrics.emailService}
        metricLabel="Activos"
      />

      <ActionCard
        title="SFTP Notification"
        icon={<IconFileText size={20} />}
        color="grape"
        statusText="con conexion SFTP"
        metric={onMetrics.sftpService}
        metricLabel="Activos"
      />
    </SimpleGrid>
  );
}