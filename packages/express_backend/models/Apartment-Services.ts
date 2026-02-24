import mongoose, { get } from "mongoose";
import { Apartment } from "./Apartment";

function createApartment(data: any) {
	return Apartment.create(data);
}
function getApartmentById(aptId: string) {
	return Apartment.findById(aptId);
}
function updateApartment(aptId: string, data: any) {
	return Apartment.findByIdAndUpdate(aptId, data);
}
function deleteApartment(aptId: string) {
	return Apartment.findByIdAndDelete({ _id: aptId });
}

function addMember(user: string) {
	//FIXME this will be changed to user Schema, users should store apartment id's
}
function removeMember(user: string) {
	//FIXME this will be changed to user Schema, users should store apartment id's
}

export default {
	createApartment,
	getApartmentById,
	updateApartment,
	deleteApartment,
};
