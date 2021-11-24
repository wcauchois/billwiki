import { gql, useQuery } from "@apollo/client";
import * as qs from "query-string";
import React from "react";
import { useMemo } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import * as gqlTypes from "../generated/gqlTypes";
import TopBar from "./system/TopBar";

const searchQuery = gql`
  query search($query: String!) {
    search(query: $query) {
      ...searchResult
    }
  }

  fragment searchResult on SearchResult {
    nameField {
      text
      ...searchResultField
    }
    contentField {
      ...searchResultField
    }
  }

  fragment searchResultField on SearchResultField {
    fragment
    highlights {
      ...textHighlightRange
    }
  }

  fragment textHighlightRange on TextHighlightRange {
    start
    end
  }
`;

function HighlightedText({
  fragment,
  highlights,
  scrollFirstHighlightIntoView,
}: {
  fragment: string;
  highlights: Array<{ start: number; end: number }>;
  scrollFirstHighlightIntoView?: boolean;
}) {
  // Inspiration: https://docs.rs/tantivy/0.15.3/src/tantivy/snippet/mod.rs.html#93-95
  let result = <React.Fragment />;
  let startFrom = 0;
  let isFirst = true;
  for (const highlight of highlights) {
    const extraProps =
      isFirst && scrollFirstHighlightIntoView
        ? {
            ref: (el: HTMLElement | null) => {
              if (el) {
                el.scrollIntoView();
              }
            },
          }
        : {};
    result = (
      <>
        {result}
        {fragment.substring(startFrom, highlight.start)}
        <strong {...extraProps}>
          {fragment.substring(highlight.start, highlight.end)}
        </strong>
      </>
    );
    startFrom = highlight.end;
    isFirst = false;
  }
  result = (
    <>
      {result}
      {fragment.substring(startFrom)}
    </>
  );
  return result;
}

function SingleResult({ result }: { result: gqlTypes.searchResult }) {
  const history = useHistory();
  const pageLink = `/wiki/${result.nameField.text.replace(/ /g, "_")}`;

  return (
    <li className="mb-5">
      <div>
        <Link
          to={pageLink}
          className="text-blue-500 text-lg font-bold underline mb-10"
        >
          <HighlightedText {...result.nameField} />
        </Link>
      </div>
      <pre
        className="text-sm cursor-pointer border-solid border-2 p-2 max-h-40 overflow-y-hidden"
        onClick={() => history.push(pageLink)}
      >
        <HighlightedText
          {...result.contentField}
          scrollFirstHighlightIntoView
        />
      </pre>
    </li>
  );
}

function SearchResultsMain({ results }: { results: gqlTypes.searchResult[] }) {
  return (
    <ul className="">
      {results.map((result, i) => (
        <SingleResult key={i} result={result} />
      ))}
    </ul>
  );
}

export default function SearchResults() {
  const location = useLocation();
  const query = useMemo(() => {
    const parsed = qs.parse(location.search);
    return (parsed.q || "") as string;
  }, [location]);

  const { data, loading } = useQuery<gqlTypes.search, gqlTypes.searchVariables>(
    searchQuery,
    {
      variables: {
        query,
      },
    }
  );

  return (
    <div>
      <TopBar title="Search results" initialSearch={query} />
      {!loading && data && <SearchResultsMain results={data.search} />}
    </div>
  );
}
