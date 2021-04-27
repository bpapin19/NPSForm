import { GraphQLSchema, MergeSchemaHelper, segment } from 'service-utils/lib';

import * as getLastNpsScore from "./getLastNpsScore";
import * as shouldShowNpsQuestion from "./shouldShowNpsQuestion";
import * as getNewNpsQuestion from "./getNewNpsQuestion";
import * as recordNpsScore from "./recordNpsScore";

const mergedSchema: MergeSchemaHelper = new MergeSchemaHelper()

mergedSchema.addSchema(getLastNpsScore.linkTypeDefs)
mergedSchema.addResolver(getLastNpsScore.resolvers)

mergedSchema.addSchema(shouldShowNpsQuestion.linkTypeDefs)
mergedSchema.addResolver(shouldShowNpsQuestion.resolvers)

mergedSchema.addSchema(getNewNpsQuestion.linkTypeDefs)
mergedSchema.addResolver(getNewNpsQuestion.resolvers)

mergedSchema.addSchema(recordNpsScore.linkTypeDefs)
mergedSchema.addResolver(recordNpsScore.resolvers)


export default mergedSchema;

