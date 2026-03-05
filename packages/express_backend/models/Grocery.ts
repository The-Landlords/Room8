import mongoose from "mongoose";

const GrocerySchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxLength: 100,
			trim: true,
		},
		quantity: {
			type: Number,
			required: true,
			min: 1,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		homeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Home",
			required: true,
			index: true,
		},
		isShared: {
			type: Boolean,
			default: false,
			index: true,
			required: false,
		},
		status: {
			type: String,
			enum: ["PENDING", "PURCHASED", "CANCELLED"],
			default: "PENDING",
			index: true,
			required: true,
		},
		completedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false,
		},
		completedAt: {
			type: Date,
			required: false,
		},
	},
	{ timestamps: true }
);
export const Grocery = mongoose.model("Grocery", GrocerySchema);
