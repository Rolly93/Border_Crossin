import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Progress, 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  ThemeIcon,
  Box,
  rem
} from '@mantine/core';

interface UnderConstructionProps {
  projectName: string;
  expectedLaunchDate: string;
  progress:number
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  projectName ,
  expectedLaunchDate  , progress
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <Box 
      style={(theme) => ({
        backgroundColor: theme.colors.dark[8],
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <Box
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: rem(400),
          height: rem(400),
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,137,245,0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container size="sm">
        <Stack align="center" gap="xl" style={{ textAlign: 'center', zIndex: 1 }}>
          
          {/* Construction Icon */}
          <ThemeIcon 
            size={80} 
            radius="xl" 
            variant="light" 
            color="blue"
            style={(theme) => ({
              boxShadow: theme.shadows.md,
            })}
          >
            <svg 
            xmlns="http://www.w3.org/2000/svg"
              style={{ width: rem(40), height: rem(40) }}
              fill="none" 
              viewBox="0 0 16 16" 
              stroke="currentColor" 
              strokeWidth={.5}
            >
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
  <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
</svg>
          </ThemeIcon>

          <Stack gap="xs">
            <Text 
              size="xs" 
              fw={700} 
              tt="uppercase" 
              lts={1.5} 
              color="blue.4"
            >
              Coming Soon
            </Text>
            <Title 
              order={1} 
              style={(theme) => ({
                color: theme.white,
                fontSize: rem(38),
                fontWeight: 900,
                letterSpacing: rem(-0.5),
              })}
            >
              {projectName} is Under Construction
            </Title>
            <Text c="dimmed" size="lg" maw={520} mx="auto">
              We are working hard to build a seamless experience. Something awesome is launching soon, expected by{' '}
              <Text span c="gray.2" fw={500}>{expectedLaunchDate}</Text>.
            </Text>
          </Stack>

          <Box style={{ width: '100%', maxWidth: rem(440) }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">Development Status</Text>
              <Text size="xs" fw={700} c="blue.4">{progress}% Complete</Text>
                </Group>
            <Progress.Root size="xl">
              <Progress.Section 
                value={progress} 
                animated
                color={progress > 80 ? 'green' : progress > 40 ? 'orange' : 'red'}
                >
                <Progress.Label>{progress}%</Progress.Label>
              </Progress.Section>
            </Progress.Root>
          </Box>

        {/** <Box style={{ width: '100%', maxWidth: rem(440) }} mt="md">
            {isSubscribed ? (
              <Box 
                p="md" 
                style={(theme) => ({
                  border: `${rem(1)} solid ${theme.colors.green[9]}`,
                  backgroundColor: 'rgba(43, 138, 62, 0.1)',
                  borderRadius: theme.radius.md
                })}
              >
                <Text size="sm" c="green.4" fw={500}>
                  🎉 Thanks! We will notify you as soon as we go live.
                </Text>
              </Box>
            ) : (
              <form onSubmit={handleSubscribe}>
                <Group gap="xs" grow preventGrowOverflow={false}>
                  <TextInput
                    type="email"
                    required
                    placeholder="Enter your email for updates"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    radius="md"
                    styles={(theme) => ({
                      input: {
                        backgroundColor: theme.colors.dark[6],
                        borderColor: theme.colors.dark[4],
                        color: theme.white,
                        '&:focus': {
                          borderColor: theme.colors.blue[5],
                        },
                      },
                    })}
                  />
                  <Button 
                    type="submit" 
                    color="blue" 
                    radius="md"
                    style={{ flexGrow: 0 }}
                  >
                    Notify Me
                  </Button>
                </Group>
              </form>
            )}
          </Box>*/}  

          <Text size="xs" c="dark.3" mt="xl">
            &copy; {new Date().getFullYear()} All rights reserved. Secure Logistics Infrastructure.
          </Text>

        </Stack>
      </Container>
    </Box>
  );
};