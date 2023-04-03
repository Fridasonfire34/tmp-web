import { NextApiRequest, NextApiResponse } from 'next';

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
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Pong',
    timestamp: new Date().toISOString(),
    stack: null
  });
}
