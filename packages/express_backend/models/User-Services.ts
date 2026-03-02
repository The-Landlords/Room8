import { User } from "./User";

export async function getUserByUsername(username: string) {
  return User.findOne({ username });
}

export async function createUser(data: any) {
  return User.create(data);
}

export async function getUserById(userId: string) {
  return User.findById(userId);
}