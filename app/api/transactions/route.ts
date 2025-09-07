import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate("userId", "name email")
      .populate("policyId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
