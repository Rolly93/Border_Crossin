import { createTheme, MantineColorsTuple } from '@mantine/core';

/**
 * XBorder Design System
 *
 * Subject: Cross-border logistics (Mexico ↔ USA) — industrial, precise, high-stakes
 * Audience: Dispatchers, operators, admins who need dense, scannable data
 */

// Custom color scales (10-step Mantine format)
const navy: MantineColorsTuple = [
  '#f0f4f8', '#d9e2ec', '#bcccdc', '#9fb3c8', '#829ab1',
  '#627d98', '#486581', '#334e68', '#243b53', '#102a43',
];

const slate: MantineColorsTuple = [
  '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
  '#64748b', '#475569', '#334155', '#1e293b', '#0f172a',
];

const amber: MantineColorsTuple = [
  '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
  '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
];

const emerald: MantineColorsTuple = [
  '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399',
  '#10b981', '#059669', '#047857', '#065f46', '#064e3b',
];

const rose: MantineColorsTuple = [
  '#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185',
  '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337',
];

const sky: MantineColorsTuple = [
  '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
  '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
];

export const theme = createTheme({
  primaryColor: 'amber',
  colors: {
    navy,
    slate,
    amber,
    emerald,
    rose,
    sky,
  },

  // Typography
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
  headings: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: 'clamp(1.75rem, 2vw + 1rem, 2.5rem)', lineHeight: '1.2', fontWeight: '800' },
      h2: { fontSize: 'clamp(1.5rem, 1.5vw + 1rem, 2rem)', lineHeight: '1.25', fontWeight: '700' },
      h3: { fontSize: 'clamp(1.25rem, 1vw + 1rem, 1.5rem)', lineHeight: '1.3', fontWeight: '700' },
      h4: { fontSize: '1.125rem', lineHeight: '1.35', fontWeight: '600' },
      h5: { fontSize: '1rem', lineHeight: '1.4', fontWeight: '600' },
      h6: { fontSize: '0.875rem', lineHeight: '1.4', fontWeight: '600' },
    },
  },

  defaultRadius: 'sm',
  radius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  shadows: {
    xs: '0 1px 2px 0 rgb(15 23 42 / 0.08)',
    sm: '0 1px 3px 0 rgb(15 23 42 / 0.1), 0 1px 2px -1px rgb(15 23 42 / 0.1)',
    md: '0 4px 6px -1px rgb(15 23 42 / 0.1), 0 2px 4px -2px rgb(15 23 42 / 0.1)',
    lg: '0 10px 15px -3px rgb(15 23 42 / 0.1), 0 4px 6px -4px rgb(15 23 42 / 0.1)',
    xl: '0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.1)',
  },

  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
        color: 'navy',
        radius: 'sm',
        fw: 600,
        size: 'sm',
      },
      styles: {
        root: {
          '&[dataVariant="filled"]': {
            '&:hover': {
              backgroundColor: 'var(--mantine-color-navy-7)',
            },
          },
          '&[dataColor="amber"]': {
            backgroundColor: 'var(--mantine-color-amber-6)',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'var(--mantine-color-amber-7)',
            },
          },
        },
      },
    },

    TextInput: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },

    Select: {
      defaultProps: {
        radius: 'sm',
        size: 'sm',
      },
    },

    Table: {
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: 'xs',
        horizontalSpacing: 'md',
        stickyHeader: true,
        striped: false,
      },
      styles: {
        th: {
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingTop: '10px',
          paddingBottom: '10px',
          // Adaptable a Dark/Light mode
          color: 'var(--mantine-color-dimmed)',
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '2px solid var(--mantine-color-default-border)',
        },
        td: {
          fontSize: '0.8125rem',
          paddingTop: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        },
        tr: {
          '&:lastOfType td': {
            borderBottom: 'none',
          },
        },
      },
    },

    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        withBorder: true,
      },
      styles: {
        root: {
          borderColor: 'var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        },
      },
    },

    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
        overlayProps: {
          backgroundOpacity: 0.5,
          style: { backdropFilter: 'blur(4px)' },
        }
      },
      styles: {
        content: {
          padding: '20px',
        },
        title: {
          fontWeight: 700,
          fontSize: '1.125rem',
        },
      },
    },

    Badge: {
      defaultProps: {
        radius: 'xs',
        size: 'sm',
        fw: 600,
      },
    },

    Alert: {
      defaultProps: {
        radius: 'sm',
        withCloseButton: true,
      },
      styles: {
        root: {
          borderWidth: '1px',
        },
      },
    },

    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
        withBorder: true,
        p: 'md',
      },
      styles: {
        root: {
          borderColor: 'var(--mantine-color-default-border)',
          backgroundColor: 'var(--mantine-color-body)',
        },
      },
    },

    NavLink: {
      defaultProps: {
        radius: 'sm',
        variant: 'light',
        fw: 500,
      },
      styles: {
        root: {
          '&[dataActive]': {
            // Estilos para Light Mode
            '[dataMantineColorScheme="light"] &': {
              backgroundColor: 'var(--mantine-color-amber-1)',
              color: 'var(--mantine-color-amber-9)',
            },
            // Estilos para Dark Mode
            '[dataMantineColorScheme="dark"] &': {
              backgroundColor: 'var(--mantine-color-amber-9)',
              color: 'var(--mantine-color-amber-1)',
            },
          },
        },
      },
    },

    AppShell: {
      defaultProps: {
        header: { height: 56 },
        navbar: { width: { base: 260, sm: 280 }, breakpoint: 'sm' },
        padding: 'md',
      },
      styles: {
        header: {
          backgroundColor: 'var(--mantine-color-body)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        },
        navbar: {
          backgroundColor: 'var(--mantine-color-body)',
          borderRight: '1px solid var(--mantine-color-default-border)',
        },
        main: {
          // Fondo del canvas principal
          '[dataMantineColorScheme="light"] &': {
            backgroundColor: 'var(--mantine-color-slate-0)',
          },
          '[dataMantineColorScheme="dark"] &': {
            backgroundColor: 'var(--mantine-color-dark-8)',
          },
        },
      },
    },
  },
});