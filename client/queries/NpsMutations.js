import gql from "graphql-tag";

export const RECORD_NPS_SCORE = gql`
    mutation recordNpsScore($input: RecordNpsScoreInput!) { 
        recordNpsScore(input: $input) {
            id
        }
    }
`;