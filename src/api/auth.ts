import express, { RequestHandler } from "express"
import { db } from "../utils/db"
import { hash, verify } from "argon2"
import { HttpError } from "../utils/error"
import { asyncHandlerWrapper, AsyncRequestHandler } from "../utils/async-handler"
import jwt from "jsonwebtoken"
import { uuid } from "uuidv4"
import axios from "axios"
import dotenv from "dotenv"
import { makeAccessToken, makeRefreshToken } from "../utils/jwt"

dotenv.config()

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_AUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
// const GOOGLE_AUTH_REDIRECT_URL = "http://localhost:3000/auth/google/callback"
const GOOGLE_AUTH_REDIRECT_URL = "https://api.takingprize.com/auth/google/callback"

const login: AsyncRequestHandler = async (req, res) => {
  const { email, password } = req.body
  const user = await db.userCollection().findOne({ email })
  if (!user) {
    res.status(400).json({ message: "email이 존재하지 않습니다. " })
    return
    // throw new HttpError(res, 400, "email이 존재하지 않습니다.")
  }
  const isVerifiedPassword = async (hashedPassword: string, password: string) => {
    return await verify(hashedPassword, password)
  }
  if (!(await isVerifiedPassword(user.hashedPassword!!, password))) {
    res.status(400).json({ message: "비밀번호가 틀립니다. " })
    return
    // throw new HttpError(res, 400, `비밀번호가 틀립니다.`)
  }
  const name = user.name
  const id = user.id

  const token = jwt.sign({ email, name, id }, "sunnmy")
  res.status(200).json({
    email,
    name,
    id,
    token,
  })
}

const signup: AsyncRequestHandler = async (req, res) => {
  const { email, name, password } = req.body
  const user = await db.userCollection().findOne({ email: email })
  console.log(user)
  if (user) {
    res.status(409).json({ message: "이미 존재하는 email 입니다. " })
    return
    // throw new HttpError(res, 400, "이미 존재하는 email입니다.")
  }
  const hashedPassword = await hash(password)
  const id = uuid()
  await db.userCollection().insertOne({ email, hashedPassword, name, id })
  const token = jwt.sign({ email, name, id }, "sunnmy")
  res.status(201).json({
    email,
    name,
    id,
    token,
  })
}

export const verifyUserHandler: RequestHandler = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] as string
  if (!token) {
    throw new HttpError(res, 400, "Token was not provided")
  }
  const data = jwt.verify(token, "sunnmy") as { email: string; name: string; id: string }
  const email = data.email
  const name = data.name
  const id = data.id
  res.send({ email, name, id })
}

const snsSignup = async (args: { email: string; name: string; snsId: string; type: string }) => {
  const id = uuid()
  await db.userCollection().insertOne({ ...args, id })
  return id
}

export const verifyGoogle: AsyncRequestHandler = async (req, res) => {
  console.log("요청 들어옴")
  console.log(req.query)
  const { code } = req.query
  try {
    // Authorization Code와 Access Code 교환
    const { data } = await axios({
      method: "POST",
      url: `${GOOGLE_AUTH_TOKEN_URL}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      params: {
        grant_type: "authorization_code", //고정 스트링
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET_ID,
        redirectUri: GOOGLE_AUTH_REDIRECT_URL,
        code: code, // Authorization Code
      },
    })
    console.log("data")
    console.log(data)
    const access_token = data["access_token"]

    // 필요한 리소스 접근
    const { data: resource } = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    )
    console.log(resource)
    const { sub, email, name } = resource
    const userInformation = {
      email,
      name,
      snsId: sub,
      type: "google",
    }
    const user = await db.userCollection().findOne({ email: email })
    if (user) {
      console.log("user 있음")
      const token = jwt.sign({ email, name, id: user.id }, "sunnmy")
      res.cookie("accessJwtToken", token, {
        // httpOnly: true,
      })
    } else {
      const userId = await snsSignup(userInformation)
      const token = jwt.sign({ email, name, id: userId }, "sunnmy")
      res.cookie("accessJwtToken", token, {
        // httpOnly: true,
      })
    }
  } catch (error) {
    // console.log(error)
  }

  // return res.redirect("http://localhost:3001")
  return res.redirect("https://takingprize.com")
}

const authRouter = express.Router()
authRouter.post("/login", asyncHandlerWrapper(login))
authRouter.post("/signup", asyncHandlerWrapper(signup))
authRouter.get("/user", verifyUserHandler)
authRouter.get("/google/callback", asyncHandlerWrapper(verifyGoogle))
authRouter.get("/logout")
authRouter.get("change-password")
export default authRouter
