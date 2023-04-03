import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.headers;
  const { packingId } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id as string
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }

    const packing = await prisma.inventory.findUnique({
      where: {
        id: packingId as string
      }
    });

    if (!packing) {
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'Packing not found',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }

    const updatePacking = await prisma.inventory.update({
      where: {
        id: packingId as string
      },
      data: {
        quantity: packing.quantity - 1,
        scannedBy: user.employeeId
      }
    });

    if (!updatePacking)
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'Packing not found',
        timestamp: new Date().toISOString(),
        stack: null
      });

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Packing updated',
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
}
