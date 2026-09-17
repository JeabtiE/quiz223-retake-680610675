import express, { type Request, type Response } from "express";

// import middlewares
import morgan from "morgan";

import invalidJsonMiddleware from "./middlewares/invalidJsonMiddleware.js";
import notFoundMiddleware from "./middlewares/notFoundMiddleware.js";


import itemsRoutes from "./routes/itemsRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();
const port = 3000;

// body parser middleware
app.use(express.json());

// logger middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));

app.use("/api/v675/auth", usersRoutes);
app.use("/api/v675/basket", itemsRoutes);

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("Quiz #2 - API service");
});

app.get("/me", (req: Request, res: Response) => {
  res.status(200).json({
    success: true, 
    message: "Student Information", 
    data: {
      studentId: "680610675",
      firstName: "Nattapat", 
      lastName: "Srirung",
      section: "001", 
    },
  });
});

app.use(notFoundMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// Export app for vercel deployment
export default app;
