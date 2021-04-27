import { MergedContext } from '../../getContext'
import { bigQuery, mysqlConnection } from 'service-utils/lib'


export const linkTypeDefs = `
  input RecordNpsScoreInput {
    value: Int
    extraText: String
    questionId: String
  }

  extend type Mutation {
    recordNpsScore(input: RecordNpsScoreInput!): NpsScore
  }
`

export const resolvers = {
  Mutation: {

    recordNpsScore: async (_, args, context: MergedContext) => {
      try {

        const npsScoreData = Object.assign({}, args.input, {userId: context.currentUser.id});
        const createNpsScoreArgs = {
          input: {
            npsScore: npsScoreData,
          }
        }
        const result = await context.nps.mutation.createNpsScore(createNpsScoreArgs, "{ npsScore {id createdAt updatedAt deletedAt userId questionId value extraText } }", {context})
        const score = result.npsScore;
        return score;

      } catch (e) {
        console.error(e)
        throw new Error(e)
      }
    },

  },
}


