import Agenda, { Job } from "agenda";

import dotenv from "dotenv";
import { endBedPeriod } from "./functions";

dotenv.config();

const DATA_BASE_URL = process.env.MONGODB_URI as string;

const agenda = new Agenda({
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

    agenda.define("END_BED_PERIOD", async (job: Job) => {
      await endBedPeriod(job.attrs.data["bedId"]);
    });
  } catch (err) {}
}

export default class AgendaHelper {
  static readonly agenda = agenda;

  // End property post
  static async scheduleEndBedPeriod(bedId: string, date: Date) {
    const jobs = await agenda.jobs({
      name: "END_BED_PERIOD",
      "data.adId": bedId,
    });

    if (jobs.at(0)) await jobs[0].remove();

    await agenda.schedule(date, "END_BED_PERIOD", { bedId });

    console.log("Successfully scheduled an end bed period");
  }
}
