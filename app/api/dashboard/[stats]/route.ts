import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import TransactionPolicy from "@/models/TransactionPolicy";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const [
      totalCustomers,
      totalPolicies,
      totalBalance,
      recentTransactions,
      transactionStats,
    ] = await Promise.all([
      User.countDocuments(),
      TransactionPolicy.countDocuments({ isActive: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
      Transaction.find()
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(10),
      Transaction.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const stats = {
      totalCustomers,
      totalPolicies,
      totalBalance: totalBalance[0]?.total || 0,
      recentTransactions,
      transactionStats: transactionStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount,
        };
        return acc;
      }, {}),
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
