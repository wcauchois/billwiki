import { gql } from "@apollo/client";

export const pageFragment = gql`
  fragment page on Page {
    id
    name
    content
  }
`;
