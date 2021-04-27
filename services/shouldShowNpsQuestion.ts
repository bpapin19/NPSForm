import { MergedContext } from '../../getContext'
import { bigQuery, mysqlConnection } from 'service-utils/lib'
import { getLastNpsScore } from "./getLastNpsScore";
import { graphql, GraphQLArgs } from 'graphql'

const moment = require("moment");

export const linkTypeDefs = `
  extend type Query {
    shouldShowNpsQuestion: Boolean
  }
`

export const resolvers = {
  Query: {

    shouldShowNpsQuestion: async (_, args, context: MergedContext) => {
      try {

        const userId = context.currentUser.id;
        return shouldShowNpsQuestion(userId, context);

      } catch (e) {
        console.error(e)
        throw new Error(e)
      }
    },

  },
}

export async function shouldShowNpsQuestion(userId, context) {

  // Get owner's completed rentals
  const queryArgs: GraphQLArgs = {
        schema: context.serverSchema,
        contextValue: Object.assign({}, context, {skipAuth: true}),
        source:`query User {
            user(where:{id:"${userId}"}){
                id
                owner{
                    id
                  rentals(filter:{
                    status_in: COMPLETED
                  }) {
                    id
                  }
                }
            }
        }`
    }
    const res = await graphql(queryArgs)

  const ownerPastRentals = res.data.user.owner.rentals
  const lastScore = await getLastNpsScore(userId, context);

  // If there is no last score and the owner has past rentals, show NPS
  if ((lastScore) && (ownerPastRentals.length !== 0)) {
    return true;
    // If there is a last score and the owner has past rentals, show NPS
  } else if ((lastScore) && (ownerPastRentals.length !== 0)) {
    const daysSinceLastScore = moment().diff(moment(lastScore.createdAt), "days")
    if (daysSinceLastScore > 60) {
      return true;
    }
    return false;
  } else {
    return false;
  }
}

