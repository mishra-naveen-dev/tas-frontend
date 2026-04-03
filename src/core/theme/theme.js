import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main: '#2563eb',     // 🔵 strong blue
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },

        secondary: {
            main: '#0ea5e9',     // sky blue accent
        },

        success: {
            main: '#22c55e',
        },

        warning: {
            main: '#f59e0b',
        },

        error: {
            main: '#ef4444',
        },

        background: {
            default: '#f5f7fb',   // soft dashboard background
            paper: '#ffffff',
        },

        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },

    typography: {
        fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,

        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        body2: {
            fontSize: '0.9rem',
        },
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        // ================= BUTTON =================
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 16px',
                    boxShadow: 'none',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1e40af, #1e3a8a)',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    },
                },
            },
        },

        // ================= CARD =================
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 14,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                    border: '1px solid #eef2f7',
                },
            },
        },

        // ================= APP BAR =================
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: '#2563eb',
                    boxShadow: 'none',
                },
            },
        },

        // ================= CHIP =================
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 6,
                },
            },
        },

        // ================= TABLE =================
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#f1f5f9',
                },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#334155',
                },
                body: {
                    color: '#475569',
                },
            },
        },

        // ================= PAPER =================
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },

});

export default theme;