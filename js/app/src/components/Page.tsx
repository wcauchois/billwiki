import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { convertMarkdownToHtml } from "../lib/markdown";
import Button from "./Button";
import PageEditor from "./PageEditor";

const pageDetailsQuery = gql`
  query pageDetails($name: String!) {
    page(name: $name) {
      name
      content
    }
  }
`;

function PageMain({ page }: { page: any }) {
  const [editing, setEditing] = useState(false);

  const pageHtml = useMemo(() => convertMarkdownToHtml(page.content), [page.content]);

  return (
    <>
      <div>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>
      {editing ? (
        <PageEditor
          initialValue={page.content} />
      ) : (
        <>
          {pageHtml !== null && (
            <div dangerouslySetInnerHTML={{ __html: pageHtml }} />
          )}
        </>
      )}
    </>
  );
}

export default function Page() {
  const params = useParams<{ name: string }>();
  const pageName = params.name.replace(/_/g, " ");

  const { loading, error, data } = useQuery(pageDetailsQuery, {
    variables: {
      name: pageName,
    },
  });


  return (
    <div>
      <h1>{pageName}</h1>
      {data && <PageMain page={data.page} />}
    </div>
  );
}
