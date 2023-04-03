import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

import { decrypt } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@email.com' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: '********'
        }
      },
      async authorize(credentials, req) {
        const { employeeId, password } = credentials as Record<string, string>;
        if (!employeeId || !password) {
          throw new Error('Credenciales invalidas');
        }
        const user = await prisma.user.findUnique({
          where: {
            employeeId
          }
        });
        if (!user) {
          throw new Error('Usuario no encontrado');
        } else {
          const isPasswordValid = await prisma.user.findUnique({
            where: {
              employeeId
            },
            select: {
              password: true
            }
          });
          const isDecryptedPassword = decrypt(password, user.password);
          if (isPasswordValid && isDecryptedPassword) {
            const isAdmin = user.role?.toUpperCase() === 'ADMIN';
            if (!isAdmin) {
              throw new Error('El usuario no tiene permisos de acceso');
            }
            return user;
          }
        }
        throw new Error('Invalid Credentials');
      }
    })
  ],
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/sign-in'
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      return session;
    }
  }
};

export default NextAuth(authOptions);
