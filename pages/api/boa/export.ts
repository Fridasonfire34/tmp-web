import excel from 'exceljs';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
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

    if (!userId) {
      res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        OR: [
          { week: { contains: 'Boa', mode: 'insensitive' } },
          { week: { contains: 'Viper', mode: 'insensitive' } }
        ]
      }
    });

    const workbookName = `Viper & Boa`;
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet(workbookName);
    worksheet.columns = [
      // { key: 'id', header: 'ID', width: 10 },
      { key: 'partNumber', header: 'Part Number', width: 15 },
      {
        key: 'buildSequence',
        header: 'Build Sequence',
        width: 15
      },
      {
        key: 'balloonNumber',
        header: 'Balloon Number',
        width: 15
      },
      {
        key: 'quantity',
        header: 'Quantity',
        width: 10
      },
      {
        key: 'poNo',
        header: 'Po. No.',
        width: 15
      },
      {
        key: 'vendorNo',
        header: 'Vendor No.',
        width: 15
      },
      {
        key: 'packingDiskNo',
        header: 'Packing Disk No.',
        width: 15
      },
      {
        key: 'line',
        header: 'Line',
        width: 10
      },
      {
        key: 'scannedBy',
        header: 'Scanned By',
        width: 10
      },
      {
        key: 'updatedAt',
        header: 'updatedAt',
        width: 10
      }
    ];
    worksheet.addRows(inventory);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `${workbookName}.xlsx`
    );

    return workbook.xlsx.write(res).then(() => {
      res.status(200).end();
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
