import axios from "axios";

import { ISoccer } from "../interfaces/ISoccer";
import { redisConnection } from "../redis/redis";

const categories: Record<number, string> = {
  1: "Euro Cup",
  2: "Copa do Mundo",
  3: "Premier League",
  4: "Superleague",
};

async function getApiOdds(league: number) {
  await axios
    .get(
      `${process.env.BBTIPS_API}/api/futebolvirtual?liga=${league}&futuro=false&Horas=Horas3&tipoOdd=` ||
        "",
      {
        headers: {
          Authorization: `Bearer ${process.env.JWT_TOKEN}`,
          origin: "https://www.bbtips.com.br",
        },
      }
    )

    .then((response) => {
      response.data.Linhas[0].Colunas.filter((odd: ISoccer) => odd.Horario).map(
        async (odd: ISoccer) => {
          const oddFormat = {
            odd_hour: odd.Hora,
            hour: odd.Horario,
            minute: odd.Minuto,
            categoryName: categories[league],
            winner: odd.Vencedor_HT_FT.split(" ")[2],
            firstTimeScoring:
              odd.PrimeiroMarcar === "A" ? odd.TimeA : odd.TimeB,
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
            totalGoals: `${
              Number(odd.Resultado.split("-")[0]) +
              Number(odd.Resultado.split("-")[1])
            }`,
            turned: odd.Viradinha ? true : false,
            league,
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

          await redisConnection.publish(categories[league], JSON.stringify(oddFormat))
          .then(e => console.log(odd.Horario))
          .catch(err => console.error(err));
        }
      );
    })
    .catch((err) => {
      console.error(err);
    });
}

export { getApiOdds };
