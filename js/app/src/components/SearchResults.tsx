import { gql, useQuery } from "@apollo/client";
import * as qs from "query-string";
import React from "react";
import { useMemo } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";

import styles from "./SearchResults.module.scss";

const searchQuery = gql`
  query search($query: String!) {
    search(query: $query) {
      nameField {
        text
        ...searchResultField
      }
      contentField {
        ...searchResultField
      }
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
}: {
  fragment: string;
  highlights: Array<{ start: number; end: number }>;
}) {
  // Inspiration: https://docs.rs/tantivy/0.15.3/src/tantivy/snippet/mod.rs.html#93-95
  let result = <React.Fragment />;
  let startFrom = 0;
  for (const highlight of highlights) {
    result = (
      <>
        {result}
        {fragment.substring(startFrom, highlight.start)}
        <strong>{fragment.substring(highlight.start, highlight.end)}</strong>
      </>
    );
    startFrom = highlight.end;
  }
  result = (
    <>
      {result}
      {fragment.substring(startFrom)}
    </>
  );
  return result;
}

function SingleResult({ result }: { result: any }) {
  const history = useHistory();
  const pageLink = `/wiki/${result.nameField.text.replace(/ /g, "_")}`;

  return (
    <li className={styles.singleResult}>
      <Link to={pageLink} className={styles.resultTitle}>
        <HighlightedText {...result.nameField} />
      </Link>
      <pre
        className={styles.resultContent}
        onClick={() => history.push(pageLink)}
      >
        <HighlightedText {...result.contentField} />
      </pre>
    </li>
  );
}

function SearchResultsMain({ results }: { results: any[] }) {
  return (
    <ul className={styles.resultList}>
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

  const { data, loading } = useQuery(searchQuery, {
    variables: {
      query,
    },
  });

  return (
    <div>{!loading && data && <SearchResultsMain results={data.search} />}</div>
  );
}
