import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });

  try {
    const { id, week } = req.headers;
    const {
      partNumber,
      buildSequence,
      vendorNo,
      packingDiskNo,
      line,
      poNo,
      quantity,
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
      await prisma.inventory.create({
        data: {
          id: v4(),
          partNumber: String(partNumber),
          buildSequence: Number(buildSequence),
          vendorNo: Number(vendorNo),
          packingDiskNo: Number(packingDiskNo),
          line: String(line),
          poNo: String(poNo),
          quantity: Number(quantity),
          scannedBy: String(scannedBy),
          week: String(week)
        }
      });
      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Successfully added',
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
