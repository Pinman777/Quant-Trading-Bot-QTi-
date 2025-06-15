import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { botId, action } = req.query;
    if (!['start', 'stop'].includes(action as string)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${botId}/${action}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} bot`);
    }

    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error(`Error ${req.query.action}ing bot:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 