import { gql, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { convertMarkdownToHtml } from "../lib/markdown";
import { useMoustrap as useMousetrap } from "../lib/mousetrap";
import Button from "./Button";
import PageEditor from "./PageEditor";

const pageDetailsQuery = gql`
  query pageDetails($name: String!) {
    page(name: $name) {
      id
      name
      content
    }
  }
`;

const updatePageMutation = gql`
  mutation updatePage($input: PageInput!) {
    update(input: $input) {
      id
      name
      content
    }
  }
`;

function PageMain({ page }: { page: any }) {
  const [editing, setEditing] = useState(false);

  const pageHtml = useMemo(
    () => convertMarkdownToHtml(page.content),
    [page.content]
  );

  const [updatePage] = useMutation(updatePageMutation);

  const [editedContent, setEditedContent] = useState(page.content);
  const stopEditing = useCallback(() => {
    setEditedContent(page.content);
    setEditing(false);
  }, [page.content]);
  const startEditing = useCallback(() => {
    setEditing(true);
  }, []);

  useMousetrap('e', useCallback(() => {
    startEditing();
  }, [startEditing]));

  const savePage = async () => {
    try {
      await updatePage({
        variables: {
          input: {
            name: page.name,
            content: editedContent,
          },
        },
      });
      stopEditing();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <>
      <div>
        {editing ? (
          <>
            <Button onClick={stopEditing}>Cancel</Button>
            <Button
              onClick={() => {
                savePage();
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <Button onClick={startEditing}>Edit</Button>
        )}
      </div>
      {editing ? (
        <PageEditor
          initialValue={page.content}
          onChange={(newValue) => setEditedContent(newValue)}
          onSave={() => {
            savePage();
          }}
        />
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
