import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { exclude } from '@/src/utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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
