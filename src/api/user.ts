import { asyncHandlerWrapper, AsyncRequestHandler } from "../utils/async-handler"
import { db } from "../utils/db"
import { HttpError } from "../utils/error"
import express, { RequestHandler } from "express"

const getUser: AsyncRequestHandler = async (req, res) => {
  const id = req.query.id as string
  if (!id) {
    throw new HttpError(res, 400, "요청 오류.")
  }
  const user = await db.userCollection().findOne({ id })
  if (!user) {
    throw new HttpError(res, 400, "유저가 존재하지 않습니다.")
  }

  const name = user.name

  res.status(200).json({
    name,
  })
}

const userRouter = express.Router()
userRouter.get("/", asyncHandlerWrapper(getUser))

export default userRouter
