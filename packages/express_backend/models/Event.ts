// https://mongoosejs.com/docs/
import mongoose from "mongoose";
// as of 14 April 2026, we are assuming all events created through this are shared events, and we are not importing individual calendars

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
		// either home or valid address
		location: {
			type: String,
			default: "Apartment", // TODO fix this to fetch apartment name
			required: true,
			maxLength: 100,
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
