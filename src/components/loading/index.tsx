import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = () => {
  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Actualizando información...
      </Typography>
      <CircularProgress />
    </Box>
  );
};

export default Loading;
