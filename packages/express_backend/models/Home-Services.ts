import mongoose, { get } from "mongoose";
import { Home } from "./Home";

function createHome(data: any) {
	return Home.create(data);
}
function getHomeById(homeId: string) {
	return Home.findById(homeId);
}
function updateHome(homeId: string, data: any) {
	return Home.findByIdAndUpdate(homeId, data);
}
function deleteHome(homeId: string) {
	return Home.findByIdAndDelete({ _id: homeId });
}

function addMember(user: string) {
	//FIXME this will be changed to user Schema, users should store Home id's
}
function removeMember(user: string) {
	//FIXME this will be changed to user Schema, users should store Home id's
}

export default {
	createHome,
	getHomeById,
	updateHome,
	deleteHome,
};
