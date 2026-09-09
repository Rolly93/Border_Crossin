import { useState } from 'react';
import { Container, Paper, Stepper, Title, Text } from '@mantine/core';
import { EmployeeForm } from "@/features/employee/compnents/EmployeeForm";
import { NewuserForm } from "./NewUserForm";

export function FirstTimeLog() {
  const [activeStep, setActiveStep] = useState(0);

  const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));

  return (
    <Container size="sm" py={50}>
      <Paper withBorder shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb={5}>
          Initial System Setup
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Create the primary employee record and administrator account
        </Text>

        <Stepper active={activeStep} mb="xl">
          <Stepper.Step label="Employee" description="Personal details">
            <EmployeeForm onSuccess={nextStep} />
          </Stepper.Step>

          <Stepper.Step label="Account" description="Login credentials">
            <NewuserForm onSuccess={nextStep} />
          </Stepper.Step>

          <Stepper.Completed>
            <Text ta="center" fw={500} c="green">
              Setup complete! Redirecting to dashboard...
            </Text>
          </Stepper.Completed>
        </Stepper>
      </Paper>
    </Container>
  );
}