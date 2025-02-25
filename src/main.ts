import {
  express,
  cors,
  helmet,
  rateLimit,
  morgan,
  load,  // Previously was incorrectly referenced as dotenvConfig
} from "./deps.ts";
import { AppDataSource } from "./database.ts";

// Load environment variables
try {
  const env = await load();
  // Copy environment variables to Deno.env
  for (const [key, value] of Object.entries(env)) {
      Deno.env.set(key, value);
  }
  console.log("Environment variables loaded successfully");
} catch (error) {
  console.error("Error loading environment variables:", error);
  Deno.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Initialize database connection
try {
  await AppDataSource.initialize();
  console.log("Data Source has been initialized!");
} catch (error) {
  console.error("Error during Data Source initialization:", error);
  Deno.exit(1);
}

// Routes
app.get("/", (_req, res) => {
  res.send("Hello from Deno and Express with TypeORM!");
});

// Start server
const port = Number(Deno.env.get("APP_PORT")) || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 