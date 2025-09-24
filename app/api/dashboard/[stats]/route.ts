import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // await dbConnect();

    // const [
    //   totalCustomers,
    //   totalPolicies,
    //   totalBalance,
    //   recentTransactions,
    //   transactionStats,
    // ] = await Promise.all([
    //   User.countDocuments(),
    //   TransactionPolicy.countDocuments({ isActive: true }),
    //   User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
    //   Transaction.find()
    //     .populate("userId", "name")
    //     .sort({ createdAt: -1 })
    //     .limit(10),
    //   Transaction.aggregate([
    //     {
    //       $group: {
    //         _id: "$status",
    //         count: { $sum: 1 },
    //         totalAmount: { $sum: "$amount" },
    //       },
    //     },
    //   ]),
    // ]);

    // const stats = {
    //   totalCustomers,
    //   totalPolicies,
    //   totalBalance: totalBalance[0]?.total || 0,
    //   recentTransactions,
    //   transactionStats: transactionStats.reduce((acc, stat) => {
    //     acc[stat._id] = {
    //       count: stat.count,
    //       totalAmount: stat.totalAmount,
    //     };
    //     return acc;
    //   }, {}),
    // };

    async function getBalanceTransactions() {
      try {
        const balanceTransactions = await stripe.balanceTransactions.list({
          limit: 100,
        });
        return balanceTransactions.data;
      } catch (error) {
        console.error("Error fetching balance transactions:", error);
        return [];
      }
    }

    async function getTransactionsWithUserDetails() {
      const balanceTransactions = await getBalanceTransactions();
      const transactionsWithDetails = [];

      for (const transaction of balanceTransactions) {
        if (
          transaction.type === "charge" ||
          (transaction.type === "payment" && transaction.source)
        ) {
          try {
            const charge = await stripe.charges.retrieve(transaction.source, {
              expand: ["customer"], // Expand the customer object for user details
            });

            const userDetails = charge.customer
              ? {
                  id: charge.customer.id,
                  email: charge.customer.email,
                  name: charge.customer.name,
                  phone: charge.customer.phone,
                }
              : null;

            transactionsWithDetails.push({
              ...transaction,
              userDetails,
              chargeDetails: charge,
            });
          } catch (error) {
            console.error(
              `Error retrieving charge ${transaction.source}:`,
              error
            );
          }
        } else {
          transactionsWithDetails.push(transaction); // Include other types of transactions
        }
      }
      return transactionsWithDetails;
    }

    async function getTransactionsWithTypeAndUserDetails() {
      const transactionsWithDetails = await getTransactionsWithUserDetails();
      const finalTransactions = [];

      for (const transaction of transactionsWithDetails) {
        let transactionType = "unknown";

        if (transaction.type === "charge" && transaction.chargeDetails) {
          if (
            transaction.chargeDetails.invoice &&
            transaction.chargeDetails.invoice.subscription
          ) {
            transactionType = "recurring";
          } else {
            transactionType = "one_off";
          }
        }

        finalTransactions.push({
          ...transaction,
          transactionType,
        });
      }
      return finalTransactions;
    }

    const stripeTransactions = await getTransactionsWithUserDetails();

    return NextResponse.json({ stripe: stripeTransactions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
