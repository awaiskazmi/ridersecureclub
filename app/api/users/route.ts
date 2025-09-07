import dbConnect from "@/lib/mongodb";
import { stripe } from "@/lib/stripe";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const userData = await request.json();

    // Create Stripe customer
    const stripeCustomer = await stripe.customers.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: {
        line1: userData.address.street,
        city: userData.address.city,
        state: userData.address.state,
        postal_code: userData.address.zipCode,
        country: userData.address.country,
      },
    });

    // Create user in database
    const user = new User({
      ...userData,
      stripeCustomerId: stripeCustomer.id,
    });

    await user.save();
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
