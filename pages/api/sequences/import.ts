import multiparty from 'multiparty';
import { NextApiRequest, NextApiResponse } from 'next';
import xlsx from 'node-xlsx';
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
    const { id } = req.headers;
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

    const form = new multiparty.Form();
    form.parse(req, async (err, _, files) => {
      if (err) {
        return res.status(500).json({
          success: false,
          status: 'error',
          message: err.message,
          timestamp: new Date().toISOString(),
          stack: null
        });
      } else {
        const file = files?.files[0];
        const fileNames = file.originalFilename.split('.')[0];
        if (file.size > 0) {
          const fileObj = xlsx.parse(file.path);
          const parseFile = fileObj[0]?.data;
          const [, ...rows] = parseFile;

          if (rows.length > 0) {
            const dataParse = rows.map(row => {
              const [
                partNumber,
                buildSequence,
                balloonNumber,
                quantity,
                poNo,
                vendorNo,
                packingDiskNo,
                line
              ] = row as string[];
              return {
                id: v4(),
                partNumber: partNumber ? String(partNumber) : null,
                buildSequence: buildSequence ? Number(buildSequence) : null,
                balloonNumber: balloonNumber ? String(balloonNumber) : null,
                quantity: quantity ? Number(quantity) : null,
                poNo: poNo ? String(poNo) : null,
                vendorNo: vendorNo ? Number(vendorNo) : null,
                packingDiskNo: packingDiskNo ? Number(packingDiskNo) : null,
                line: line ? String(line) : null,
                week: String(fileNames)
              };
            }) as any;

            try {
              await prisma.inventory.createMany({
                data: dataParse
              });

              return res.status(200).json({
                success: true,
                status: 'success',
                message: 'File uploaded successfully',
                timestamp: new Date().toISOString(),
                stack: dataParse
              });
            } catch (e) {
              if (e instanceof Error) {
                return res.status(500).json({
                  success: false,
                  status: 'error',
                  message: e.message,
                  timestamp: new Date().toISOString(),
                  stack: null
                });
              }
            }
          } else {
            return res.status(500).json({
              success: false,
              status: 'error',
              message: 'File is empty',
              timestamp: new Date().toISOString(),
              stack: null
            });
          }
        } else {
          return res.status(500).json({
            success: false,
            status: 'error',
            message: 'File is empty',
            timestamp: new Date().toISOString(),
            stack: null
          });
        }
      }
    });
  } catch (e) {
    if (e instanceof Error) {
      return res.status(500).json({
        success: false,
        status: 'error',
        message: e.message,
        timestamp: new Date().toISOString(),
        stack: null
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: false
  }
};
