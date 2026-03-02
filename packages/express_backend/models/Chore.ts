import mongoose from "mongoose";

const ChoreSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxLength: 100,
			trim: true,
		},
		description: {
			type: String,
			required: false,
			maxLength: 400,
			trim: true,
		},
		homeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Home",
			required: true,
			index: true,
		},
		isCompleted: {
			type: Boolean,
			default: false,
			index: true,
			required: false,
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
		isRecurring: {
			type: Boolean,
			default: false,
			index: true,
		},
		nextOccurrence: {
			type: Date,
			required: function (): boolean {
				return this.isRecurring;
			},
			index: true,
			default: function (): Date | undefined {
				if (!this.isRecurring) return undefined;

				const now = new Date();
				return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // default to 1 week from now
			},
		},
	},
	{ timestamps: true }
);
export const Chore = mongoose.model("Chore", ChoreSchema);
