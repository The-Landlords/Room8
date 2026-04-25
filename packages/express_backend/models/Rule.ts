import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    voteId: {
      type: String,
      required: true,
    },
    vote: {
      type: String,
      enum: ["YES", "NO"],
      required: true,
    },
  },
  { _id: false }
);

const RuleSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxLength: 100,
    trim: true,
  },

  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"],
    default: "PENDING",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  homeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true,
  },

  votes: {
    type: [VoteSchema],
    default: [],
  },

  // ✅ DELETE VOTING SYSTEM
  deleteVotes: {
    type: [VoteSchema],
    default: [],
  },

  deleteStatus: {
    type: String,
    enum: ["NONE", "PENDING", "CONFIRMED", "REJECTED"],
    default: "NONE",
  },
});

export const Rule = mongoose.model("Rules", RuleSchema);