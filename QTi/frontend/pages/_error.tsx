import { NextPage } from 'next';
import { Box, Container, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          {statusCode || 'Error'}
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Go back home
        </Button>
      </Box>
    </Container>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 