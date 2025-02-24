import express from "npm:express@4.18.2";
import cors from "npm:cors";
import helmet from "npm:helmet";
import rateLimit from "npm:express-rate-limit";
import morgan from "npm:morgan";

const app = express();



// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
app.get("/", (_req, res) => {
  res.send("Hello from Deno and Express!");
});


// Start server
const port = Number(Deno.env.get("APP_PORT")) || 3000;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

