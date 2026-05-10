import { Request, Response } from 'express';
import { getDashboardAnalyticsService } from '../service/analytics.service';

export const getAnalyticsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const data = await getDashboardAnalyticsService(userId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    if (error.message === 'No restaurant found for this admin') {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Analytics Fetch Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
