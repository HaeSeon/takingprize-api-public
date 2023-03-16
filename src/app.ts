import express, { RequestHandler } from "express"
import cors from "cors"
import bodyParser from "body-parser"
import authRouter from "./api/auth"
import session from "express-session"
import userRouter from "./api/user"
import prizeRouter from "./api/prize"

const app = express()
const port = 3000
const corsOptions = {
  origin: "https://takingprize.com",
  // origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions)) //
app.set("trust proxy", 1)
app.use(bodyParser.json())

app.set("trust proxy", 1)
app.use(
  session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
)

app.use("/auth", authRouter)
app.use("/users", userRouter)
app.use("/prizes", prizeRouter)

export const testHandler: RequestHandler = (req, res) => {
  res.send({ message: "taking prize api v1.0" })
}

app.use("/test", express.Router().get("/", testHandler))

app.listen(port, () => {
  console.log(`서버가 ${port}에서 동작중입니다.`)
})
