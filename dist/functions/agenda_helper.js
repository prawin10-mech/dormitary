"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const agenda_1 = __importDefault(require("agenda"));
const dotenv_1 = __importDefault(require("dotenv"));
const functions_1 = require("./functions");
dotenv_1.default.config();
const DATA_BASE_URL = process.env.MONGODB_URI;
const agenda = new agenda_1.default({
    db: {
        address: DATA_BASE_URL,
        collection: "AgendaJobs",
        options: {
            tls: true,
        },
    },
    processEvery: "10 seconds",
});
agenda.on("ready", () => {
    initJobs();
});
// ----------------------------------------------------------
async function initJobs() {
    try {
        await agenda.start();
        /************* BED PERIOD ************** */
        agenda.define("END_BED_PERIOD", async (job) => {
            await (0, functions_1.endBedPeriod)(job.attrs.data["bedId"]);
        });
    }
    catch (err) { }
}
class AgendaHelper {
    // End property post
    static async scheduleEndBedPeriod(bedId, date) {
        const jobs = await agenda.jobs({
            name: "END_BED_PERIOD",
            "data.adId": bedId,
        });
        if (jobs.at(0))
            await jobs[0].remove();
        await agenda.schedule(date, "END_BED_PERIOD", { bedId });
        console.log("Successfully scheduled an end bed period");
    }
}
AgendaHelper.agenda = agenda;
exports.default = AgendaHelper;
