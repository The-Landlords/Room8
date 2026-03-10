import mongoose from "mongoose";

const RelationshipSchema = new mongoose.Schema({
	homeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Home",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	relationship: {
		type: String,
		enum: ["RESIDENT", "GUEST"],
		required: true,
	},
});

export const Relationship = mongoose.model("Relationship", RelationshipSchema);
