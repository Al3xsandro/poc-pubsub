import dotenv from "dotenv";
dotenv.config();

import Cron from "cron";
import "./redis/redis";

import { getApiOdds } from "./controller/getApiOdds";

Cron.job(
  "*/3 * * * *",
  async () => {
    console.log("[Info] reset soccer");
    await getApiOdds(1);
    await getApiOdds(2);
    await getApiOdds(3);
    await getApiOdds(4);
  },
  null,
  true,
  "America/Sao_Paulo"
);