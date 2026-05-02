// server/controllers/homeController.js
import User from "../models/user.js";
import Review from "../models/review.js";


export const fetchBasicData = async (req, res) => {
  try {
    // Active users count
    const activeUsers = await User.countDocuments({ onlineStatus: 'active' });
    const totalUsers = await User.countDocuments();

    const allReviews = await Review.find();

    // 6 most recent reviews
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Fetch user info based on email
    const reviewsWithUser = await Promise.all(
      recentReviews.map(async (r) => {
        const user = await User.findOne({ email: r.email }).select('name username avatar');
        return { ...r.toObject(), user };
      })
    );

    // Calculate review statistics
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const reviewStats = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Satisfaction rate
    const satisfactionStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          satisfiedReviews: {
            $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
          }
        }
      }
    ]);
    const stats = satisfactionStats[0] || { totalReviews: 0, satisfiedReviews: 0 };
    const satisfactionRate =
      stats.totalReviews > 0
        ? Math.round((stats.satisfiedReviews / stats.totalReviews) * 100)
        : 0;

    // New users in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Send response
    res.status(200).json({
      success: true,
      activeUsers,
      totalUsers,
      newUsersLast30Days: newUsers,
      reviewStats: {
        averageRating: reviewStats,
        totalReviews: allReviews.length,
        helpfulVotes: 0,
        satisfactionRate
      },
      recentReviews: reviewsWithUser.map(review => ({
        _id: review._id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        user: review.user || { name: 'Anonymous', avatar: null, username: '' },
        tags: review.tags,
        createdAt: review.createdAt,
        formattedDate: new Date(review.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }))
    });
  } catch (error) {
    console.error(`[homeController.js] Error: ${error}`);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    // Total users by status
    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: '$onlineStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    // Reviews by rating
    const reviewsByRating = await Review.aggregate([
      {
        $match: { verified: true }
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    // Monthly user growth
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 6
      }
    ]);

    res.json({
      success: true,
      usersByStatus: usersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      reviewsByRating: reviewsByRating.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      monthlyGrowth: monthlyGrowth.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch dashboard statistics" 
    });
  }
};