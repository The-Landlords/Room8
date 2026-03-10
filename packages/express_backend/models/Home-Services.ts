import { Home } from "./Home";
import mongoose from "mongoose";

export function createHome(data: any) {
	return Home.create(data);
}
export function getHomeById(homeId: mongoose.Types.ObjectId | string) {
	return Home.findById(homeId);
}

export function getHomeByCode(homeCode: string) {
	return Home.findOne({ homeCode: homeCode });
}

//ASK ABOUT USERS FIRST need to figure out how to implement this nested table on the home side as well

export function updateHome(
	homeId: mongoose.Types.ObjectId | string,
	data: any
) {
	return Home.findByIdAndUpdate(homeId, data, {
		returnDocument: "after",
		runValidators: true,
	});
}
export function deleteHome(homeId: mongoose.Types.ObjectId | string) {
	return Home.findByIdAndDelete({ _id: homeId });
}

// commenting for coverage
// export function addMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
// export function removeMember(user: string) {
// 	//FIXME this will be changed to user Schema, users should store Home id's
// }
