import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT')
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });

  try {
    const { id } = req.headers;
    const {
      id: idSeqence,
      partNumber,
      buildSequence,
      quantity,
      packingDiskNo,
      scannedBy
    } = req.body;

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
      await prisma.inventory.update({
        where: {
          id: idSeqence as string
        },
        data: {
          partNumber,
          buildSequence,
          quantity: Number(quantity),
          packingDiskNo,
          scannedBy
        }
      });
      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Inventory updated successfully',
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
