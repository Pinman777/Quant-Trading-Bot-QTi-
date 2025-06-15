import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/market-data`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    const marketData = await response.json();
    res.status(200).json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 