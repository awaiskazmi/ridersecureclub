import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    /**
     * SERVER ERROR 500: DISABLED FOR NOW
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const query = userId ? { userId } : {};
    const policies = await TransactionPolicy.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(policies);
    */
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    /**
     * SERVER ERROR 500: DISABLED FOR NOW
    await dbConnect();
    */
    const policyData = await request.json();

    // Get user and validate
    // TODO: verify user from stripe

    // const user = await User.findById(policyData.userId);
    // if (!user) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    // Create transaction policy
    // const policy = new TransactionPolicy(policyData);
    // await policy.save();

    // Process upfront payment if amount > 0
    if (policyData.upfrontAmount > 0) {
      /**
         * STRIPE CONNECTED ACCOUNT FEE: DISABLED FOR NOW
      const upfrontTransferAmount = Math.round(
        policyData.upfrontAmount * 100 * 0.03
      );
      */

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(policyData.upfrontAmount * 100), // Convert to cents
        currency: "aud",
        // customer: user.stripeCustomerId,
        customer: policyData.userId,
        payment_method: policyData.paymentMethodId,
        confirm: true,
        return_url: "http://localhost:3000/payments",
        /**
         * STRIPE CONNECTED ACCOUNT FEE: DISABLED FOR NOW
        application_fee_amount: upfrontTransferAmount,
        transfer_data: {
          destination: process.env.STRIPE_CONNECTED_ACCOUNT_ID as string,
          // amount: upfrontTransferAmount,
        },
        */
      });

      // Create transaction record
      // const upfrontTransaction = new Transaction({
      //   userId: policyData.userId,
      //   policyId: policy._id,
      //   amount: policyData.upfrontAmount,
      //   type: "upfront",
      //   status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
      //   stripePaymentIntentId: paymentIntent.id,
      //   processedAt: paymentIntent.status === "succeeded" ? new Date() : null,
      // });
      // await upfrontTransaction.save();
    }

    // Set up recurring payment subscription
    if (policyData.recurringAmount > 0) {
      let interval = policyData.frequency;
      let intervalCount = 1;

      const recurringDateObject = new Date(policyData.recurringDate);
      const billingAnchorTimeStamp = Math.floor(
        recurringDateObject.getTime() / 1000
      );

      const price = await stripe.prices.create({
        currency: "aud",
        unit_amount: Math.round(policyData.recurringAmount * 100),
        recurring: { interval: policyData.frequency },
        product_data: {
          name: policyData.name,
        },
      });

      const subscription = await stripe.subscriptions.create({
        // customer: user.stripeCustomerId,
        customer: policyData.userId,
        items: [{ price: price.id }],
        billing_cycle_anchor: billingAnchorTimeStamp,
        // payment_behavior: "pending_if_incomplete",
        // items: [
        //   {
        //     price_data: {
        //       currency: "usd",
        //       product_data: { name: `${policy.name} - Recurring Payment` },
        //       unit_amount: Math.round(policyData.recurringAmount * 100),
        //       recurring: {
        //         interval:
        //           interval === "yearly"
        //             ? "year"
        //             : interval === "monthly"
        //             ? "month"
        //             : "week",
        //         interval_count: intervalCount,
        //       },
        //     },
        //   },
        // ],
        default_payment_method: policyData.paymentMethodId,
        expand: ["latest_invoice.payment_intent"],
        /**
         * STRIPE CONNECTED ACCOUNT FEE: DISABLED FOR NOW
        
        application_fee_percent: 3,
        transfer_data: {
          destination: process.env.STRIPE_CONNECTED_ACCOUNT_ID as string,
        },
        */
      });

      // Update policy with subscription ID
      // policy.stripeSubscriptionId = subscription.id;
      // await policy.save();
    }

    // return NextResponse.json(policy, { status: 201 });
    return NextResponse.json(policyData, { status: 201 });
  } catch (error) {
    console.error("Policy creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
