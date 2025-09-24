import dbConnect from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import TransactionPolicy from "@/models/TransactionPolicy";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const policyData = await request.json();

    const policy = await TransactionPolicy.findByIdAndUpdate(
      params.id,
      policyData,
      { new: true }
    );

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Update Stripe subscription if needed
    if (policy.stripeSubscriptionId && policyData.recurringAmount) {
      await stripe.subscriptions.update(policy.stripeSubscriptionId, {
        items: [
          {
            price_data: {
              currency: "aud",
              product_data: {
                name: `${policy.name} - Recurring Payment`,
              },
              unit_amount: Math.round(policyData.recurringAmount * 100),
              recurring: {
                interval:
                  policyData.frequency === "yearly"
                    ? "year"
                    : policyData.frequency === "monthly"
                    ? "month"
                    : "week",
              },
            },
          },
        ],
      });
    }

    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const policy = await TransactionPolicy.findById(params.id);

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    // Cancel Stripe subscription
    if (policy.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(policy.stripeSubscriptionId);
    }

    await TransactionPolicy.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Policy deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
