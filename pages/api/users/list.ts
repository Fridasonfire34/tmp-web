import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { exclude } from '@/src/utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET')
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });

  try {
    const { id } = req.headers;
    const userId = await prisma.user.findUnique({
      where: {
        id: id as string
      }
    });

    if (!userId)
      res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });

    const users = await prisma.user.findMany();
    const userWithoutPassword = users.map(user => {
      return exclude(user, ['password', 'updatedAt', 'createdAt']);
    });
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Users fetched successfully',
      timestamp: new Date().toISOString(),
      stack: userWithoutPassword
    });
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
