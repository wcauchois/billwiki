import { gql, useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { convertMarkdownToComponent } from "../lib/markdown";
import { useMoustrap as useMousetrap } from "../lib/mousetrap";
import Button from "./system/Button";
import Header from "./system/Header";
import List from "./system/List";
import PageEditor from "./PageEditor";
import Rule from "./system/Rule";
import { pageFragment } from "../lib/fragments";
import * as gqlTypes from "../generated/gqlTypes";

const pageDetailsQuery = gql`
  query pageDetails($name: String!) {
    page(name: $name) {
      ...page
    }
  }

  ${pageFragment}
`;

const updatePageMutation = gql`
  mutation updatePage($input: PageInput!) {
    update(input: $input) {
      ...page
    }
  }

  ${pageFragment}
`;

function PageMain({ page }: { page: gqlTypes.page }) {
  const [editing, rawSetEditing] = useState(false);

  const pageComponent = useMemo(
    () => convertMarkdownToComponent(page.content),
    [page.content]
  );

  const [updatePage] = useMutation<
    gqlTypes.updatePage,
    gqlTypes.updatePageVariables
  >(updatePageMutation);

  const [editedContent, setEditedContent] = useState(page.content);
  const setEditing = useCallback(
    (newEditing: boolean) => {
      setEditedContent(page.content);
      rawSetEditing(newEditing);
    },
    [page.content]
  );
  const stopEditing = useCallback(() => setEditing(false), [setEditing]);
  const startEditing = useCallback(() => setEditing(true), [setEditing]);

  useMousetrap(
    "e",
    useCallback(() => {
      startEditing();
    }, [startEditing])
  );

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
    <List fluid>
      <div>
        <List horizontal>
          {editing ? (
            <>
              <Button onClick={stopEditing}>Cancel</Button>
              <Button
                onClick={() => {
                  savePage();
                }}
                primary
              >
                Save
              </Button>
            </>
          ) : (
            <Button onClick={startEditing}>Edit</Button>
          )}
        </List>
      </div>
      <Rule />
      {editing ? (
        <PageEditor
          initialValue={page.content}
          onChange={(newValue) => setEditedContent(newValue)}
          onSave={() => {
            savePage();
          }}
        />
      ) : (
        <div>{pageComponent}</div>
      )}
    </List>
  );
}

export default function Page() {
  const params = useParams<{ name: string }>();
  const pageName = params.name.replace(/_/g, " ");

  const { data } = useQuery(pageDetailsQuery, {
    variables: {
      name: pageName,
    },
  });

  return (
    <div>
      <Header level={1}>{pageName}</Header>
      {data && <PageMain page={data.page} />}
    </div>
  );
}
