import { asyncHandlerWrapper, AsyncRequestHandler } from "../utils/async-handler"
import { db } from "../utils/db"
import { HttpError } from "../utils/error"
import express, { RequestHandler } from "express"
import { ObjectId } from "mongodb"
import { Prize } from "../model/prize"

const postPrize: AsyncRequestHandler = async (req, res) => {
  const userId = req.query.userId as string
  const data = req.body
  if (!userId) {
    throw new HttpError(res, 400, "요청 오류.")
  }
  const user = await db.userCollection().findOne({ id: userId })
  if (!user) {
    throw new HttpError(res, 400, "사용자 없음")
  }
  const userObjectId = new ObjectId(user._id)
  await db.prizeCollection().insertOne({ ...data, userObjectId })

  res.sendStatus(200)
}

//왜 model 에서 못불러오지 불러오면 지우자
const filteredPrize = (prize: Prize) => {
  return {
    templateIndex: prize.templateIndex,
    frameIndex: prize.frameIndex,
    contents: prize.contents,
    trophyIndex: prize.trophyIndex,
    message: prize.message,
    author: prize.author,
  }
}

const getPrizes: AsyncRequestHandler = async (req, res) => {
  const userId = req.query.userId as string
  const page = parseInt(req.query.page as string)

  const user = await db.userCollection().findOne({ id: userId })
  if (!user) {
    throw new HttpError(res, 400, "사용자 없음")
  }
  const userObjectId = new ObjectId(user._id)

  const prizesCount = await db.prizeCollection().find({ userObjectId }).count()
  const pageSize = 9
  const prizes: Prize[] = await db
    .prizeCollection()
    .find({
      userObjectId,
    })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray()

  const filteredPrizes = prizes.map((prize) => {
    return filteredPrize(prize)
  })
  res.status(200).json({ count: prizesCount, result: filteredPrizes })
}

const prizeRouter = express.Router()
prizeRouter.post("/", asyncHandlerWrapper(postPrize))
prizeRouter.get("/", asyncHandlerWrapper(getPrizes))

export default prizeRouter
