import React, { FC, PropsWithChildren, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Box, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import Footer from '@/src/components/footer';
import Loading from '@/src/components/loading';
import NavBar from '@/src/components/navbar';
import { AuthType } from '@/src/types/auth';

const Layout: FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === AuthType.Unauthenticated) {
      router.replace('/auth/sign-in');
    }
  }, [router, status]);

  if (status === AuthType.Authenticated) {
    return (
      <>
        <NavBar />
        <Container>
          <Box my={2}>{children}</Box>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                border: '1px solid #fff'
              }
            }}
          />
        </Container>
      </>
    );
  }

  return <Loading />;
};

export default Layout;
