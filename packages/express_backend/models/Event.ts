// https://mongoosejs.com/docs/
import mongoose from "mongoose";

export const EventSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			maxLength: 100,
			trim: true, // eliminates whitespaces
		},
		description: {
			type: String,
			required: false,
			maxLength: 400,
			trim: true,
		},
		start: {
			type: Date,
			required: true,
			index: true,
		},
		end: {
			type: Date,
			required: true,
			index: true,
		},
		eventType: {
			type: String,
			enum: ["HOME", "TOGETHER", "PERSONAL"],
			required: true,
			index: true,
		},

		homeId: {
			// type:
			type: mongoose.Schema.Types.ObjectId,
			ref: "Home",
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["PENDING", "CONFIRMED", "CANCELLED"],
			default: "PENDING",
			index: true,
			required: false,
		},
	},
	{ timestamps: true }
);

// rejects invalid documents pre-save
// pre("save") would be rewriting data before save
EventSchema.pre("validate", async function () {
	if (this.end <= this.start) {
		throw new Error("End must be after start time");
	}
});
export const Event = mongoose.model("Event", EventSchema); // this gets put in mongo db compass
