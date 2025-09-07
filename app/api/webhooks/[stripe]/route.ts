import dbConnect from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent) {
  await Transaction.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    {
      status: "succeeded",
      processedAt: new Date(),
    }
  );
}

async function handlePaymentFailed(paymentIntent) {
  await Transaction.findOneAndUpdate(
    { stripePaymentIntentId: paymentIntent.id },
    {
      status: "failed",
      failureReason:
        paymentIntent.last_payment_error?.message || "Payment failed",
      processedAt: new Date(),
    }
  );
}

async function handleInvoicePaymentSucceeded(invoice) {
  const transaction = await Transaction.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    {
      status: "succeeded",
      processedAt: new Date(),
    }
  );

  if (transaction) {
    // Update user balance
    await User.findByIdAndUpdate(transaction.userId, {
      $inc: { balance: -transaction.amount },
    });
  }
}

async function handleInvoicePaymentFailed(invoice) {
  await Transaction.findOneAndUpdate(
    { stripeInvoiceId: invoice.id },
    {
      status: "failed",
      failureReason: "Invoice payment failed",
      processedAt: new Date(),
    }
  );
}
