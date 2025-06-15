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

    const { userId } = req.query;
    if (session.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/bots`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bots');
    }

    const bots = await response.json();
    res.status(200).json(bots);
  } catch (error) {
    console.error('Error fetching bots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 