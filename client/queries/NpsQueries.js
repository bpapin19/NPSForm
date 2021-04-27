import gql from "graphql-tag";

export const SHOULD_SHOW_NPS = gql`
query shouldShowNpsQuestion {
  shouldShowNpsQuestion
}
`;

export const GET_NEW_NPS = gql`
query getNewNpsQuestion {
  getNewNpsQuestion {
    id
    text
    createdAt
  }
}
`;

export const GET_LAST_NPS = gql`
query getLastNpsScore {
  getLastNpsScore {
    id
    value
    userId
    questionId
    extraText
    createdAt
  }
}
`;