import dbConnect from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, paymentMethodId } = await request.json();

    // const user = await User.findById(userId);
    // if (!user) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    // Attach payment method to Stripe customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      // customer: user.stripeCustomerId,
      customer: userId,
    });

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return NextResponse.json({
      id: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card,
      us_bank_account: paymentMethod.us_bank_account,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
