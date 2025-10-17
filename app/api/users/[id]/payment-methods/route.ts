import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }) {
  try {
    /**
     * SERVER ERROR 500: DISABLED FOR NOW
    await dbConnect();
    */

    // const user = await User.findById(params.id);
    // if (!user) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    // const paymentMethods = await stripe.customers.listPaymentMethods(
    //   user.stripeCustomerId
    // );
    const { id } = await params;

    const paymentMethods = await stripe.customers.listPaymentMethods(id);

    return NextResponse.json(paymentMethods.data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
