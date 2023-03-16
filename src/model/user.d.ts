import { ObjectId } from "mongodb"

export interface User {
  _id: ObjectId
  email: string
  hashedPassword?: string
  name: string
  id: string
  type?: string
  snsId?: string
}

export const filteredUser = (user: User) => {
  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    id: user.id,
  }
}
