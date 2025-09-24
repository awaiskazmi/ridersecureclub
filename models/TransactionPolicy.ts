import mongoose from "mongoose";

const TransactionPolicySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  upfrontAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  recurringAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  frequency: {
    type: String,
    enum: ["week", "month", "year"],
    required: true,
  },
  recurringDate: {
    type: Number, // Day of month (1-31) for monthly, day of year (1-365) for yearly
    validate: {
      validator: function (v) {
        if (this.frequency === "week") return v == null;
        if (this.frequency === "month") return v >= 1 && v <= 31;
        if (this.frequency === "year") return v >= 1 && v <= 365;
        return false;
      },
      message: "Invalid recurring date for the selected frequency",
    },
  },
  paymentMethodId: {
    type: String,
    required: true, // Stripe payment method ID
  },
  // paymentMethodType: {
  //   type: String,
  //   enum: ["card", "bank_account"],
  //   required: true,
  // },
  stripeSubscriptionId: String, // For recurring payments
  isActive: {
    type: Boolean,
    default: true,
  },
  metadata: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

TransactionPolicySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.TransactionPolicy ||
  mongoose.model("TransactionPolicy", TransactionPolicySchema);
