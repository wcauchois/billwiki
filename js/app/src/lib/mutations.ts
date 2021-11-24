import { gql, useMutation } from "@apollo/client";
import { pageFragment } from "./fragments";
import * as gqlTypes from "../generated/gqlTypes";

export const updatePageMutation = gql`
  mutation updatePage($input: PageInput!) {
    update(input: $input) {
      ...page
    }
  }

  ${pageFragment}
`;

export function useUpdatePage() {
  return useMutation<gqlTypes.updatePage, gqlTypes.updatePageVariables>(
    updatePageMutation
  );
}
