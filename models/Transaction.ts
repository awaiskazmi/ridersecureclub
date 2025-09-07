import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TransactionPolicy",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["upfront", "recurring"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "succeeded", "failed", "canceled"],
    default: "pending",
  },
  stripePaymentIntentId: String,
  stripeInvoiceId: String,
  failureReason: String,
  processedAt: Date,
  scheduledFor: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

TransactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
