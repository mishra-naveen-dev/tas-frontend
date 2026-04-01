import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#db6363c6', // 🔴 main red
        },
        secondary: {
            main: '#b150508a', // dark red
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

export default theme;