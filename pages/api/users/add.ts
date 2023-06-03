import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { employeeId, name, password, employeeType } = req.body;

  if (req.method !== 'POST')
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
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });

    try {
      await prisma.user.create({
        data: {
          id: v4(),
          employeeId,
          name,
          password,
          role: employeeType
        }
      });
      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'User created successfully',
        timestamp: new Date().toISOString(),
        stack: null
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
