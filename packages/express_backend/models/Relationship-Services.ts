import { Relationship } from "./Relationship";
import mongoose from "mongoose";

export function createRelationship(data: any) {
	return Relationship.create(data);
}

export function getRelationshipById(
	relationshipId: mongoose.Types.ObjectId | string
) {
	return Relationship.findById(relationshipId);
}
//lists out a home's relationships (residents and guests)
export function getRelationshipByHome(
	homeId: mongoose.Types.ObjectId | string
) {
	return Relationship.find({ home: homeId });
}
//lists out a user's relationships (residents and guests)
export function getRelationshipByUser(
	userId: mongoose.Types.ObjectId | string
) {
	return Relationship.find({ user: userId });
}

//lists out a home's relationships of a given type (residents or guests)
export function getRelationshipByHomeAndType(
	homeId: mongoose.Types.ObjectId | string,
	relationshipType: string
) {
	return Relationship.find({ home: homeId, type: relationshipType });
}
//lists out a user's relationships of a given type (residents or guests)
export function getRelationshipByUserAndType(
	userId: mongoose.Types.ObjectId | string,
	relationshipType: string
) {
	return Relationship.find({ user: userId, type: relationshipType });
}

export function updateRelationship(
	relationshipId: mongoose.Types.ObjectId | string,
	data: any
) {
	return Relationship.findByIdAndUpdate(relationshipId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
export function deleteRelationship(
	relationshipId: mongoose.Types.ObjectId | string
) {
	return Relationship.findByIdAndDelete({ _id: relationshipId });
}
