import { Table } from "@mantine/core";
import { Title, Text, Group } from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import ClientModalProps from "./ClientModalProps";
import { useState, useRef, useCallback } from "react";
import { ICliente } from "@/features/clients/types/Cliente";
import { useDisclosure } from "@mantine/hooks";
import { ClientMetrics } from "./ClientMetrics";
import { ClientTableRow } from "./ClientTableRow";
import { useClients } from "../hooks/useClients";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { AtomButton } from "@/components/atoms/AtomButton";


export function ClientTable() {
  const [selectedClient, setselectedClient] = useState<ICliente | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure();
  const { clients,
    loading,
    hasMore,
    fetchNextPage,
    addClient,
    updateClient,
    deleteCliente, metrics } = useClients()

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElemntRef = useCallback((node: HTMLTableRowElement | null) => {
    if (loading) { return; }
    if (observer.current) { observer.current.disconnect() }
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchNextPage();

      }
    })
    if (node) { return observer.current.observe(node) }
  }, [loading, hasMore, fetchNextPage])

  function handleSelectClient(onSelectClient: ICliente) {
    setselectedClient(onSelectClient)
    openModal()
  }
  function handleCreateClient() {
    setselectedClient(null);
    openModal();
  };

  function handleSaveClient(formData: any) {
    const clienData: ICliente = {
      id: formData.id || null,
      name: formData.companyName,
      telefono: formData.phoneNumber,
      email: formData.email,
      estatus: true,
      sftService: formData.sftService,
      emailService: formData.emailService,
    };

    if (selectedClient) {
      updateClient(selectedClient.id, clienData)
    } else {

      addClient(clienData)
    }

  }

  function handelDeleteClient(id: number) {
    if (!id) {
      return;
    }
    deleteCliente(id)
  }



  return (
    <>

      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} c="gray.9">Cartelera de Clientes</Title>
          <Text size="sm" c="dimmed">Directorio y gestión de clientes activos</Text>
        </div>
        <Group>


          <AtomButton leftSection={<IconPlus size={16} />} color="blue" onClick={handleCreateClient}>
            Agregar Cliente
          </AtomButton>
          <AtomButton variant="default" leftSection={<IconRefresh size={16} />}>
            Actualizar
          </AtomButton>
        </Group>
      </Group>

      <ClientMetrics onMetrics={metrics} />
      <Table.ScrollContainer minWidth={760} h={500}>

        <Table
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="xs"
          miw={700}
          layout="fixed"
          stickyHeader
          mt={25}
        >
          <Table.Thead >
            <Table.Tr>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Telefono</Table.Th>
              <Table.Th>estatus</Table.Th>
              <Table.Th>SFTP Service</Table.Th>
              <Table.Th>Email Service</Table.Th>
              <Table.Th>Email Registrate</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>

            {loading && clients.length === 0 ? (
              <TableSkeletonRows rows={4} columns={6} />
            ) : (clients.map((cliente, index) => {
              const isLastElemnt = clients.length === index + 1;
              return (<ClientTableRow
                ref={isLastElemnt ? lastElemntRef : null}
                key={cliente.id}
                cliente={cliente}
                onClick={handleSelectClient}
                onDelete={handelDeleteClient}
              />)
            }))}
            {loading && <TableSkeletonRows rows={4} columns={6} />}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <ClientModalProps
        onSelectClient={selectedClient}
        opened={modalOpened}
        onClose={closeModal}
        onSave={handleSaveClient} />

    </>

  )
}