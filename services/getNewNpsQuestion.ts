import { MergedContext } from '../../getContext'
import { bigQuery, mysqlConnection } from 'service-utils/lib'
import { shouldShowNpsQuestion } from "./shouldShowNpsQuestion";

const moment = require("moment");


export const linkTypeDefs = `
  extend type Query {
    getNewNpsQuestion: NpsQuestion
  }
`

export const resolvers = {
  Query: {

    getNewNpsQuestion: async (_, args, context: MergedContext) => {
      try {

        const userId = context.currentUser.id;
        return getNewNpsQuestion(userId, context);

      } catch (e) {
        console.error(e)
        throw new Error(e)
      }
    },

  },
}

export async function getNewNpsQuestion(userId, context) {

  const shouldShow = await shouldShowNpsQuestion(userId, context);
  if (!shouldShow) {
    return null;
  }
  const allQuestionsArgs = {
  
  };
  const result = await context.nps.db.query.allNpsQuestions(allQuestionsArgs, "{ nodes { id createdAt text } }", {context})
  const questions = result.nodes;
  const questionIndex = Math.floor(Math.random() * questions.length);
  const nextQuestion = questions[questionIndex];
  return nextQuestion;

}

