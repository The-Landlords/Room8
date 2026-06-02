import mongoose from "mongoose";

export type RuleVoteValue = "YES" | "NO";
export type RuleStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type RuleDeleteStatus = "NONE" | "PENDING" | "CONFIRMED" | "REJECTED";

export interface RuleVote {
	voteId: string;
	vote: RuleVoteValue;
}

export interface RuleDocument {
	description: string;
	status: RuleStatus;
	createdAt: Date;
	homeId: mongoose.Types.ObjectId;
	votes: RuleVote[];
	deleteVotes: RuleVote[];
	deleteStatus: RuleDeleteStatus;
}

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

const RuleSchema = new mongoose.Schema<RuleDocument>({
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

export const Rule = mongoose.model<RuleDocument>("Rules", RuleSchema);
