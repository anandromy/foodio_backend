import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import "dotenv/config"
import { router as myUserRoute } from "./routes/myUserRoutes"
import { router as myRestaurantRoute } from "./routes/myRestaurantRoutes"
import ImageKit from "imagekit"

export let imagekit = new ImageKit({
    publicKey : "public_7LNujhCkHeWIJCR8iWlsLcQ40pg=",
    privateKey : "private_QmypXLgHu/9fU7lsYZ1RoSxwwkY=",
    urlEndpoint : "https://ik.imagekit.io/786vujqar"
});

const app = express()
const PORT = Number(process.env.PORT)
app.use(express.json())
app.use(cors())

app.get("/health", async(req, res) => {
    res.send({ message: "Health OK!" })
}) 

app.use("/api/my/user", myUserRoute)
app.use("/api/my/restaurant", myRestaurantRoute)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

mongoose.connect(process.env.DATABASE_URL as string).then(() => {
    console.log("Database connected")
});

