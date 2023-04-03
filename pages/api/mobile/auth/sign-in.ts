import { NextApiRequest, NextApiResponse } from 'next';

import { decrypt } from '@/lib/crypto';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.headers;

  if (req.method !== 'GET')
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email as string
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }

    const isValidPassword = decrypt(
      password as string,
      user?.password as string
    );

    if (isValidPassword) {
      const userWithoutPassword = {
        ...user,
        password: undefined
      };

      res.status(200).json({
        success: true,
        status: 'success',
        message: 'Usuario verificado',
        timestamp: new Date().toISOString(),
        stack: userWithoutPassword
      });
    } else {
      res.status(401).json({
        success: false,
        status: 'error',
        message: 'Credenciales inválidas',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({
        success: false,
        status: 'error',
        message: e.message,
        timestamp: new Date().toISOString(),
        stack: null
      });
    }
  }
}
