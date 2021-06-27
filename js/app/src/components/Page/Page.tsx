import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

const pageDetailsQuery = gql`
  query pageDetails($name: String!) {
    page(name: $name) {
      name
      content
    }
  }
`;

export default function Page() {
  const params = useParams<{ name: string }>();
  const pageName = params.name;

  const { loading, error, data } = useQuery(pageDetailsQuery, {
    variables: {
      name: pageName
    }
  });

  return (
    <div>
      A page... {JSON.stringify(data)}
    </div>
  );
}