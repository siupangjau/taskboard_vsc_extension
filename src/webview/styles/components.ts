import { theme } from './theme';

export const styles = {
    board: {
        container: {
            display: 'flex',
            gap: theme.spacing.lg,
            padding: theme.spacing.lg,
            height: '100%',
            overflowX: 'auto',
            backgroundColor: theme.colors.background,
            color: theme.colors.text
        }
    },
    column: {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.spacing.md,
            width: '300px',
            minWidth: '300px',
            backgroundColor: theme.colors.background,
            padding: theme.spacing.md,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            fontSize: theme.fontSize.lg,
            fontWeight: 'bold'
        },
        title: {
            margin: 0,
            padding: 0
        },
        ticketList: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.spacing.md,
            padding: theme.spacing.sm,
            minHeight: '100px',
            transition: theme.transition.default
        },
        ticketListDragging: {
            backgroundColor: theme.colors.selection,
            borderRadius: theme.borderRadius.md
        }
    },
    ticket: {
        container: {
            backgroundColor: theme.colors.input.background,
            color: theme.colors.input.foreground,
            border: `1px solid ${theme.colors.input.border}`,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            cursor: 'grab',
            transition: theme.transition.default,
            '&:hover': {
                borderColor: theme.colors.button.primary.bg
            }
        },
        title: {
            margin: 0,
            marginBottom: theme.spacing.sm,
            fontSize: theme.fontSize.md,
            fontWeight: 'bold'
        },
        description: {
            margin: 0,
            fontSize: theme.fontSize.sm,
            color: theme.colors.description
        },
        actions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md
        }
    },
    dialog: {
        container: {
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            minWidth: '400px'
        },
        header: {
            marginBottom: theme.spacing.lg,
            fontSize: theme.fontSize.xl,
            fontWeight: 'bold'
        }
    },
    form: {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.spacing.md
        },
        actions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg
        }
    },
    input: {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: theme.spacing.sm
        },
        label: {
            fontSize: theme.fontSize.sm,
            fontWeight: 'bold'
        },
        field: {
            backgroundColor: theme.colors.input.background,
            color: theme.colors.input.foreground,
            border: `1px solid ${theme.colors.input.border}`,
            borderRadius: theme.borderRadius.sm,
            padding: theme.spacing.sm,
            fontSize: theme.fontSize.md,
            width: '100%',
            '&:focus': {
                outline: 'none',
                borderColor: theme.colors.button.primary.bg
            }
        }
    },
    button: {
        base: {
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            borderRadius: theme.borderRadius.sm,
            border: 'none',
            cursor: 'pointer',
            fontSize: theme.fontSize.md,
            transition: theme.transition.default
        },
        primary: {
            backgroundColor: theme.colors.button.primary.bg,
            color: theme.colors.button.primary.text,
            '&:hover': {
                opacity: 0.9
            }
        },
        secondary: {
            backgroundColor: theme.colors.button.secondary.bg,
            color: theme.colors.button.secondary.text,
            '&:hover': {
                opacity: 0.9
            }
        },
        danger: {
            backgroundColor: theme.colors.button.danger.bg,
            color: theme.colors.button.danger.text,
            '&:hover': {
                opacity: 0.9
            }
        }
    },
    buttonGroup: {
        display: 'flex',
        gap: theme.spacing.sm,
        justifyContent: 'flex-end'
    },
    card: {
        base: {
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
            position: 'relative' as const
        },
        dragging: {
            background: theme.colors.selection,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }
    },
    text: {
        title: {
            margin: '0 0 0.5rem 0',
            color: theme.colors.text,
            fontSize: theme.fontSize.md
        },
        description: {
            margin: 0,
            color: theme.colors.description,
            fontSize: theme.fontSize.sm,
            whiteSpace: 'pre-wrap' as const
        }
    },
    select: {
        background: theme.colors.dropdown.background,
        color: theme.colors.dropdown.foreground,
        border: `1px solid ${theme.colors.dropdown.border}`,
        borderRadius: theme.borderRadius.sm,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.fontSize.xs,
        cursor: 'pointer'
    },
    dragAndDrop: {
        dragging: {
            opacity: 0.5,
            backgroundColor: 'var(--vscode-editor-selectionBackground)'
        }
    }
}; 