import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';

const processParts = async (rows: any) => {
  const process = rows.map((row: any) => {
    const quantity = Number(row.quantity);
    if (quantity > 1) {
      const newRows = [];
      for (let i = 0; i < quantity; i++) {
        newRows.push({
          ...row,
          quantity: 1
        });
      }
      return newRows;
    }
    return [row];
  });
  return process[0];
};

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
    const { packing } = req.query;

    const userId = await prisma.user.findUnique({
      where: {
        id: id as string
      }
    });

    if (!userId || !packing)
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });

    const packingsList = await prisma.inventory.findMany({
      where: {
        packingDiskNo: {
          equals: Number(packing)
        }
      }
    });

    if (!packingsList)
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'No inventory found',
        timestamp: new Date().toISOString(),
        stack: null
      });

    const filteredList = packingsList.map(async item => {
      const packing = await prisma.inventory.findMany({
        where: {
          packingDiskNo: item.packingDiskNo,
          partNumber: item.partNumber
        }
      });
      return {
        ...packing[0],
        parts: await processParts(packing)
      };
    });

    const finalList = await Promise.all(filteredList);
    const list = finalList.filter((item: any) => Number(item.quantity) > 0);

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Inventory fetched successfully',
      timestamp: new Date().toISOString(),
      stack: list
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
