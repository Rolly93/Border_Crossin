import { useEffect, useState } from 'react';
import { Container, Paper, Stepper, Title, Text } from '@mantine/core';
import { EmployeeForm } from "@/features/employee/components/EmployeeForm";
import { NewuserForm } from "./NewUserForm";
import { Navigate, replace, useNavigate } from 'react-router-dom';

export function FirstTimeLog() {
  const [activeStep, setActiveStep] = useState(0);
  const [rfc, setRfc] = useState('')
  const navigate = useNavigate()
  const nextStep = () => setActiveStep((current) => (current < 2 ? current + 1 : current));


  useEffect(() => {
    if (activeStep === 2) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 2000);
      return () => clearTimeout(timer)
    }
  }, [activeStep, navigate])

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
            <EmployeeForm onSuccess={nextStep} onSetRfc={setRfc} />
          </Stepper.Step>

          <Stepper.Step label="Account" description="Login credentials">
            <NewuserForm onSuccess={nextStep} onRfc={rfc} />
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