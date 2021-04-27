import { MergedContext } from '../../getContext'
import { bigQuery, mysqlConnection } from 'service-utils/lib'

const moment = require("moment");


export const linkTypeDefs = `
  extend type Query {
    getLastNpsScore: NpsScore
  }
`

export const resolvers = {
  Query: {

    getLastNpsScore: async (_, args, context: MergedContext) => {
      try {

        const userId = context.currentUser.id;
        return getLastNpsScore(userId, context);

      } catch (e) {
        console.error(e)
        throw new Error(e)
      }
    },

  },
}

export async function getLastNpsScore(userId, context) {

  const allScoresArgs = {
    condition: {
      userId: userId
    },
  };
  const result = await context.nps.query.allNpsScores(allScoresArgs, "{ nodes { id userId questionId value extraText createdAt } }", {context})
  const scores = result.nodes;
  if (!scores.length) {
    return null;
  }
  scores.sort(function(a, b) {
    return moment(a.createdAt).diff(moment(b.createdAt));
  })
  const lastScore = scores[scores.length - 1];

  return lastScore;

}


