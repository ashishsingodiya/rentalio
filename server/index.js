import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import listingRouter from "./routes/listingRoutes.js";
import visitRouter from "./routes/visitRoutes.js";
import moveInRouter from "./routes/moveInRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

await connectDB();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("ok");
});

app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);
app.use("/api/visit", visitRouter);
app.use("/api/movein", moveInRouter);
app.use("/api/ticket", ticketRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
