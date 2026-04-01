import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
            }}
        >
            <CircularProgress size={50} />
            <Typography>Loading...</Typography>
        </Box>
    );
};

export default Loader;