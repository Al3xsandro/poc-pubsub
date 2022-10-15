import axios from "axios";

import { ISoccer } from "../interfaces/ISoccer";
import { redisConnection } from "../redis/redis";

const categories: Record<number, string> = {
  1: "Euro Cup",
  2: "Copa do Mundo",
  3: "Premier League",
  4: "Superleague",
};

async function getApiOdds(league: number, line: number) {
  await axios
    .get(
      `${process.env.BBTIPS_API}/api/futebolvirtual?liga=${league}&futuro=false&Horas=Horas24&tipoOdd=` ||
        "",
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT_TOKEN}`,
          origin: "https://www.bbtips.com.br",
        },
      }
    )

    .then((response) => {
      const oddHour = response.data.Linhas[line].Hora;

      response.data.Linhas[line].Colunas.filter(
        (odd: ISoccer) => odd.Horario
      ).map(async (odd: ISoccer) => {
        const hasMoreFive = odd.Resultado.includes("+");

        const oddFormat = {
          odd_hour: odd.Hora ? odd.Hora : oddHour,
          hour: odd.Horario,
          minute: odd.Minuto,
          categoryName: categories[league],
          winner: odd.Vencedor_HT_FT.split(" ")[2],
          firstTimeScoring: odd.PrimeiroMarcar === "A" ? odd.TimeA : odd.TimeB,
          lastTimeScoring: odd.UltimoMarcar === "A" ? odd.TimeA : odd.TimeB,
          htResult: `${odd.Vencedor_HT_FT.split(" - ")[0]} - ${
            odd.Vencedor_HT_FT.split(" ")[2]
          }`,
          htFtResult: `${odd.Vencedor_HT_FT.split(" - ")[0]} - ${
            odd.Vencedor_HT_FT.split(" ")[2]
          }`,
          score: odd.Resultado,
          teamDetails: `${odd.TimeA} ${odd.Resultado.split("-")[0]} - ${
            odd.Resultado.split("-")[1]
          } ${odd.TimeB}`,
          teamOne: odd.TimeA,
          teamTwo: odd.TimeB,
          turned: odd.Viradinha ? true : false,
          league,
          totalGoals: `${
            Number(odd.Resultado.split("-")[0]) +
            Number(odd.Resultado.split("-")[1])
          }`,
          overGoals: {
            over0_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) >=
              1
                ? true
                : false,
            over1_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) >=
              2
                ? true
                : false,
            over2_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) >=
              3
                ? true
                : false,
            over3_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) >=
              4
                ? true
                : false,
          },
          underGoals: {
            under0_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) <
              1
                ? true
                : false,
            under1_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) <
              2
                ? true
                : false,
            under2_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) <
              3
                ? true
                : false,
            under3_5:
              Number(odd.Resultado.split("-")[0]) +
                Number(odd.Resultado.split("-")[1]) <
              4
                ? true
                : false,
          },
        };

        if (hasMoreFive) {
          Object.assign(oddFormat, {
            totalGoals: 7,
            overGoals: {
              over0_5: true,
              over1_5: true,
              over2_5: true,
              over3_5: true,
            },
            underGoals: {
              under0_5: false,
              under1_5: false,
              under2_5: false,
              under3_5: false,
            },
          });
        }

        await redisConnection
          .publish(categories[league], JSON.stringify(oddFormat))
          .then(() => console.log(odd.Horario))
          .catch((err) => console.error(err));
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

export { getApiOdds };
