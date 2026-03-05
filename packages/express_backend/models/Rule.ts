import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		maxLength: 100,
		trim: true,
	},
	status: {
		type: String,
		enum: ["PENDING", "CONFIRMED", "CANCELLED"],
		default: "PENDING",
		index: true,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: false,
	},
	homeId: {
		// type:
		type: mongoose.Schema.Types.Mixed, //  mongoose.Schema.Types.ObjectId OR STRING
		ref: "Home",
		required: true,
		index: true,
	},
});

export const Rule = mongoose.model("Rules", RuleSchema);
