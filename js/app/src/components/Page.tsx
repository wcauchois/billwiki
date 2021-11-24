import { gql, useQuery } from "@apollo/client";
import { ReactNode, useCallback, useMemo } from "react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { convertMarkdownToComponent } from "../lib/markdown";
import { useMoustrap as useMousetrap } from "../lib/mousetrap";
import Header from "./system/Header";
import PageEditor from "./PageEditor";
import { pageFragment } from "../lib/fragments";
import * as gqlTypes from "../generated/gqlTypes";
import classNames from "classnames";
import TextInput from "./system/TextInput";
import Button from "./system/Button";
import { useUpdatePage } from "../lib/mutations";

const pageDetailsQuery = gql`
  query pageDetails($name: String!) {
    page(name: $name) {
      ...page
    }
  }

  ${pageFragment}
`;

function PageControlTab({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?(): void;
}) {
  const classes = classNames(
    "border-solid border-2 px-6 py-1 cursor-pointer last:border-l-0 border-b-0 flex items-center text-lg",
    !active && "bg-gradient-to-b from-white via-white to-gray-200",
    active && "font-bold"
  );
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

type PageMode = "read" | "edit";

function PageControls({
  mode,
  onModeChanged,
  pageName,
  onSearch,
  onNewPage,
}: {
  mode: PageMode;
  onModeChanged(newMode: PageMode): void;
  pageName: string;
  onSearch(searchText: string): void;
  onNewPage(): void;
}) {
  return (
    <div className="flex justify-between border-b-2 border-solid mb-4">
      <div>
        <Header level={1}>{pageName}</Header>
      </div>
      <div className="flex">
        <div className="flex items-center">
          <Button onClick={onNewPage}>New Page</Button>
        </div>
        <div className="flex mx-4">
          <PageControlTab
            active={mode === "read"}
            onClick={() => {
              onModeChanged("read");
            }}
          >
            Read
          </PageControlTab>
          <PageControlTab
            active={mode === "edit"}
            onClick={() => {
              onModeChanged("edit");
            }}
          >
            Edit
          </PageControlTab>
        </div>
        <div className="flex items-center w-60">
          <TextInput
            placeholder="Search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function PageMain({ page }: { page: gqlTypes.page }) {
  const [mode, setRawMode] = useState<PageMode>("read");
  const history = useHistory();

  const pageComponent = useMemo(
    () => convertMarkdownToComponent(page.content),
    [page.content]
  );

  const onSearch = useCallback(
    (searchText: string) => {
      history.push(`/search?q=${encodeURIComponent(searchText)}`);
    },
    [history]
  );

  const [updatePage] = useUpdatePage();

  const [editedContent, setEditedContent] = useState(page.content);
  const setMode = useCallback(
    (newMode: PageMode) => {
      setEditedContent(page.content);
      setRawMode(newMode);
    },
    [page.content]
  );

  useMousetrap(
    "e",
    useCallback(() => {
      setMode("edit");
    }, [setMode])
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
      setMode("read");
    } catch (err) {
      window.alert((err as any).message);
    }
  };

  return (
    <div>
      <PageControls
        pageName={page.name}
        mode={mode}
        onModeChanged={(newMode) => setMode(newMode)}
        onSearch={onSearch}
        onNewPage={() => {
          history.push(`/new`);
        }}
      />
      {mode === "edit" && (
        <div className="flex flex-col">
          <PageEditor
            initialValue={page.content}
            onChange={(newValue) => setEditedContent(newValue)}
            onSave={() => {
              savePage();
            }}
          />
          <div className="flex justify-end mt-2">
            <Button
              primary
              onClick={() => {
                savePage();
              }}
            >
              Save Page
            </Button>
          </div>
        </div>
      )}
      {mode === "read" && <div>{pageComponent}</div>}
    </div>
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

  return <div>{data && <PageMain page={data.page} />}</div>;
}
