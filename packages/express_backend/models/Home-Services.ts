import { Home } from "./Home";
import mongoose from "mongoose";

export function createHome(data: any) {
	// create home
	//relate the userId
	return Home.create(data);
}
export function getHomeById(homeId: mongoose.Types.ObjectId) {
	return Home.findById(homeId);
}

export function getHomeByCode(homeCode: string) {
	return Home.findOne({ homeCode: homeCode });
}

export function getHomeByName(homeName: string) {
	return Home.findOne({ homeName: homeName });
}

export function getHomesByUser(userId: mongoose.Types.ObjectId) {
	return Home.find({ userIds: { $elemMatch: { userId: userId } } });
}

export function getHomesByUserAndRelation(
	userId: mongoose.Types.ObjectId,
	relationship: string
) {
	return Home.find({
		userIds: { $elemMatch: { userId: userId, relationship: relationship } },
	});
}

export function updateHome(homeId: mongoose.Types.ObjectId, data: any) {
	return Home.findByIdAndUpdate(homeId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
export function deleteHome(homeId: mongoose.Types.ObjectId) {
	return Home.findByIdAndDelete({ _id: homeId });
}

// commenting for coverage
// export function addMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
// export function removeMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
