import { Base64Encode } from 'base64-stream';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import PDFDocument from 'pdfkit';

import { prisma } from '@/lib/prisma';

const createTempDirectory = async (id: string) => {
  const __dirname = path.resolve();
  id = id.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, '');
  fs.mkdirSync(path.resolve(__dirname, id), { recursive: true });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.headers;
  const { packingId } = req.body;

  if (req.method !== 'POST')
    return res.status(405).json({
      success: false,
      status: 'error',
      message: 'API endpoint not found',
      timestamp: new Date().toISOString(),
      stack: null
    });

  try {
    const userId = await prisma.user.findUnique({
      where: {
        id: id as string
      }
    });

    if (!userId) {
      return res.status(404).json({
        success: false,
        status: 'error',
        message: 'API endpoint not found',
        timestamp: new Date().toISOString(),
        stack: null
      });
    }

    const packing = await prisma.inventory.findMany({
      where: {
        packingDiskNo: packingId
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

    const listPackings = packing.filter(item => Number(item.quantity) > 0);

    if (listPackings.length > 0) {
      const doc = new PDFDocument();
      var finalString = '';
      var stream = doc.pipe(new Base64Encode());
      createTempDirectory('/src/reports');

      var dir = fs.createWriteStream(`src/reports/report-${packingId}.pdf`);
      doc.pipe(dir);
      doc
        .fontSize(27)
        .text(
          `Kit ${packingId} has NOT been fully verified. Those items not fully verified are list below.`,
          100,
          100
        );

      doc.text('', 100, 220);
      if (listPackings.length > 0) {
        for (let i = 0; i < listPackings.length; i++) {
          const item = listPackings[i];
          doc
            .fontSize(15)
            .text(
              `ID: ${i + 1} Item: ${item.packingDiskNo} - part: ${
                item.partNumber
              } - qty: ${item.quantity} - date: ${item.updatedAt}`
            );
          doc.moveDown(1);
        }
      }
      doc.end();

      stream.on('data', function (chunk) {
        finalString += chunk;
      });

      stream.on('end', () => {
        res.json({
          success: true,
          status: 'success',
          message: 'Report generated successfully',
          timestamp: new Date().toISOString(),
          stack: finalString
        });
      });
    } else {
      const doc = new PDFDocument();
      var finalString = '';
      var stream = doc.pipe(new Base64Encode());

      doc.pipe(fs.createWriteStream(`file-${packingId}.pdf`));
      doc
        .fontSize(27)
        .text(`Kit ${packingId} has been fully verified`, 100, 100);
      doc.fontSize(15).text(`Date: ${new Date()}`, 100, 200);
      doc.end();

      stream.on('data', function (chunk) {
        finalString += chunk;
      });

      stream.on('end', () => {
        return res.json({
          success: true,
          status: 'success',
          message: 'Report generated successfully',
          timestamp: new Date().toISOString(),
          stack: finalString
        });
      });

      return;
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
