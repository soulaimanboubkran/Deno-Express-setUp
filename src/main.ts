import {
  express,
  cors,
  helmet,
  rateLimit,
  morgan,
  load,
} from "./deps.ts";
import { AppDataSource } from "./database.ts";
import { User, UserRole } from "./entity/Auth/User.ts";


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

// User Routes
const userRouter = express.Router();

// Get all users
userRouter.get("/", async (_req, res) => {
  try {
    const users = await User.find({
      select: ["id", "email", "firstName", "lastName", "country", "age", "role", "createdAt", "avatar"]
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Get user by ID
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { id: req.params.id },
      select: ["id", "email", "firstName", "lastName", "country", "age", "role", "createdAt", "avatar"]
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error fetching user with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// Create new user
userRouter.post("/", async (req, res) => {
  try {
    const { email, firstName, lastName, password, country, age, role } = req.body;
    
    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }
    
    // Hash password
    const hashedPassword = password
    
    // Create new user
    const user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = hashedPassword;
    user.country = country || null;
    user.age = age || null;
    user.role = role as UserRole || UserRole.USER;
    
    // Save user to database
    await user.save();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

// Update user
userRouter.patch("/:id", async (req, res) => {
  try {
    const { firstName, lastName, country, age } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (country !== undefined) user.country = country;
    if (age !== undefined) user.age = age;
    
    // Save updated user
    await user.save();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error(`Error updating user with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

// Delete user
userRouter.delete("/:id", async (req, res) => {
  try {
    const result = await User.softDelete(req.params.id);
    
    if (result.affected === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(`Error deleting user with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Verify password
    const isPasswordValid =password === user.password ? true : false;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Error during login", error: error.message });
  }
});

// Register main routes
app.use("/api/users", userRouter);

// Default route
app.get("/", (_req, res) => {
  res.send("Hello from Deno and Express with TypeORM!");
});

// Start server
const port = Number(Deno.env.get("APP_PORT")) || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});