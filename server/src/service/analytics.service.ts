import { prisma } from '../../prisma/client';

export const getDashboardAnalyticsService = async (userId: string) => {
  // Find the restaurant owned by the user
  const restaurant = await prisma.resturants.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!restaurant) {
    throw new Error('No restaurant found for this admin');
  }

  const restaurantId = restaurant.id;

  // 1. Total Revenue (PAID Bills)
  const paidBills = await prisma.bill.findMany({
    where: {
      order: { resturantID: restaurantId },
      paymentStatus: 'PAID',
    },
    select: {
      totalAmount: true,
      cashAmount: true,
      khaltiAmount: true,
      paymentMethod: true,
      paidAt: true,
    },
  });

  const totalRevenue = paidBills.reduce((acc, bill) => acc + bill.totalAmount, 0);

  // 2. Metrics by Payment Method
  let totalCash = 0;
  let totalKhalti = 0;
  
  paidBills.forEach((bill) => {
    // Rely on tracking fields if they exist, otherwise fallback for older records
    if (bill.paymentMethod === 'KHALTI') {
      totalKhalti += bill.khaltiAmount ?? bill.totalAmount;
    } else if (bill.paymentMethod === 'CASH') {
      totalCash += bill.cashAmount ?? bill.totalAmount;
    } else if (bill.paymentMethod === 'SPLIT') {
      totalCash += bill.cashAmount ?? 0;
      totalKhalti += bill.khaltiAmount ?? 0;
    }
  });

  // 3. Total Orders & Status Counts
  const orderStats = await prisma.order.groupBy({
    by: ['status'],
    where: { resturantID: restaurantId },
    _count: { id: true },
  });

  const totalOrders = orderStats.reduce((acc, stat) => {
    if (stat.status !== 'CANCELLED') return acc + stat._count.id;
    return acc;
  }, 0);

  // 4. Revenue Trend (Last 7 Days)
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Filter bills within the 7-day window
  const recentBills = paidBills.filter(
    (bill) => bill.paidAt && bill.paidAt >= sevenDaysAgo && bill.paidAt <= today
  );

  // Initialize 7 days array
  const trendMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Format as Month/Day (e.g. "3/19")
    const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
    trendMap.set(dateString, 0);
  }

  // Populate map
  recentBills.forEach((bill) => {
    if (bill.paidAt) {
      const d = new Date(bill.paidAt);
      const dateString = `${d.getMonth() + 1}/${d.getDate()}`;
      if (trendMap.has(dateString)) {
        trendMap.set(dateString, trendMap.get(dateString)! + bill.totalAmount);
      }
    }
  });

  const revenueTrend = Array.from(trendMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // 5. Recent Orders
  const recentOrders = await prisma.order.findMany({
    where: { resturantID: restaurantId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      bill: { select: { paymentStatus: true } }
    },
  });

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paymentBreakdown: {
      cash: totalCash,
      khalti: totalKhalti,
    },
    orderStats,
    revenueTrend,
    recentOrders,
  };
};
