"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
dotenv_1.default.config();
app.use(express_1.default.json());
//  --------------DB connection ----------------
const mongoUri = process.env.MONGODB_URI;
const apiPort = process.env.PORT
    ? parseInt(process.env.PORT, 10)
    : 3001;
mongoose_1.default
    .connect(mongoUri)
    .then(() => console.log("mongodb connected"))
    .catch((err) => console.log("mongo connection", err));
app.get("/", (req, res) => {
    return res.json({ message: "Welcome" });
});
app.use("/api/v1", routes_1.default);
app.listen(apiPort, () => console.log("Server Started"));
