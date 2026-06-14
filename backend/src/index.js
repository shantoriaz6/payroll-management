import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
    path: join(__dirname, "../.env"),
});

console.log("CORS_ORIGIN from .env:", process.env.CORS_ORIGIN);
console.log("PORT from .env:", process.env.PORT);

process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("[FATAL] Unhandled rejection at:", promise, "reason:", reason);
    process.exit(1);
});

const [{ default: connectDB }, { app }] = await Promise.all([
    import("./db/index.js"),
    import("./app.js"),
]);

const [{ default: seedAdmin }] = await Promise.all([
    import("./seed.js"),
]);

connectDB()
    .then(async () => {
        await seedAdmin();

        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(` server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection failed !!!", err);
    });
