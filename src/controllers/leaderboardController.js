/**
 * Feature 8: Community Leaderboard
 */

exports.getTopUsers = async (req, res) => {
  // Mock data for the Top 3 "Glow" Leaders
  const topUsers = [
    { rank: 1, name: "Aarav K.", glowScore: 98, streak: 15 },
    { rank: 2, name: "Sanya M.", glowScore: 95, streak: 12 },
    { rank: 3, name: "Rohan S.", glowScore: 92, streak: 30 }
  ];

  res.json({
    success: true,
    category: "Global Glow Leaders",
    leaders: topUsers
  });
};
