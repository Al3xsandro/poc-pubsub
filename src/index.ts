import dotenv from "dotenv";
dotenv.config();

import Cron from "cron";
import "./redis/redis";

import { getApiOdds } from "./controller/getApiOdds";

Cron.job(
  "*/3 * * * *",
  async () => {
    console.log("[Info] reset soccer");
    await getApiOdds(1, 0);
    await getApiOdds(2, 0);
    await getApiOdds(3, 0);
    await getApiOdds(4, 0);
  },
  null,
  true,
  "America/Sao_Paulo"
);

Cron.job(
  "5 * * * *",
  async () => {
    console.log("[Info] recover soccer");
    await getApiOdds(1, 0);
    await getApiOdds(2, 0);
    await getApiOdds(3, 0);
    await getApiOdds(4, 0);
  },
  null,
  true,
  "America/Sao_Paulo"
)