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

const [{ default: connectDB }, { app }] = await Promise.all([
    import("./db/index.js"),
    import("./app.js"),
]);

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR:", error);
            throw error;
        });

        app.listen(process.env.PORT || 6000, () => {
            console.log(` server is running at port : ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log("MONGODB connection failed !!!", err);
    });
