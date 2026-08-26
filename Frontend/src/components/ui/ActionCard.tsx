import { Card, Group, Switch, Text, ThemeIcon } from "@mantine/core";
import { ReactNode } from "react";

interface StatusCardProps {
    title: string;
    icon: ReactNode;
    color: string;
    statusText: string;
    metric?: string | number;
    metricLabel?: string;
    onClick?: () => void;
    onHandelModal?: () => void;
    onToggle?: () => void;
    checked?: boolean;
}
export default function ActionCard({
    title,
    icon,
    color,
    metric,
    metricLabel,
    onClick,
    onHandelModal, onToggle, checked

}: StatusCardProps) {
    return (<Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        onClick={onClick}
        style={{
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        miw={200}

    >
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
            {title}
        </Text>

        <Group justify="space-between" align="flex-end"  >
            <ThemeIcon color={color} variant="light" size="lg" radius="md" onClick={onHandelModal} style={{
                cursor: onHandelModal ? 'pointer' : 'default',
            }}>
                {icon}
            </ThemeIcon>

            {metric === undefined && <Switch size="lg" onLabel="Activo" offLabel="Inctivo" checked={checked}
                onChange={(event) => {
                    event.stopPropagation();
                    onToggle?.()
                }} />}


        </Group>

        {metric !== undefined && (
            <>
                <Text size="xl" fw={700} c={`${color}.6`} mt="md">
                    {metric}
                </Text>
                {metricLabel && (
                    <Text size="xs" c="dimmed" mt={2}>
                        {metricLabel}
                    </Text>
                )}
            </>
        )}
    </Card>)
}