import { gql, useQuery } from "@apollo/client";
import React, { useMemo, useState } from "react";
import * as gqlTypes from "../generated/gqlTypes";
import { DateTime } from "luxon";
import Highlight from "react-highlight";

const pageHistoryDetailsQuery = gql`
  query pageHistoryDetails($name: String!) {
    page(name: $name) {
      id
      history {
        ...fileHistoryEntry
      }
    }
  }

  fragment fileHistoryEntry on FileHistoryEntry {
    id
    commitId
    message
    date
    diff
  }
`;

interface PageHistoryProps {
  pageName: string;
}

const RIGHT_TRIANGLE = "▶"; // Black right-pointing triangle
const DOWN_TRIANGLE = "▼";

function HistoryEntry({ entry }: { entry: gqlTypes.fileHistoryEntry }) {
  const formattedDate = useMemo(
    () => DateTime.fromISO(entry.date).toFormat("HH:mm, d MMM yyyy"),
    [entry.date]
  );
  const [expanded, setExpanded] = useState(false);
  const triangle = expanded ? DOWN_TRIANGLE : RIGHT_TRIANGLE;
  return (
    <div>
      <div>
        <span className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
          {triangle}{" "}
          <span className="text-blue-500 underline">
            {formattedDate} &ndash; {entry.message}
          </span>
        </span>
      </div>
      {expanded && (
        <div>
          <Highlight className="diff">{entry.diff}</Highlight>
        </div>
      )}
    </div>
  );
}

function PageHistoryMain({ data }: { data: gqlTypes.pageHistoryDetails }) {
  return (
    <div>
      {data.page.history.map((entry, i) => (
        <HistoryEntry entry={entry} key={i} />
      ))}
    </div>
  );
}

export default function PageHistory({ pageName }: PageHistoryProps) {
  const { data } = useQuery<
    gqlTypes.pageHistoryDetails,
    gqlTypes.pageHistoryDetailsVariables
  >(pageHistoryDetailsQuery, {
    variables: {
      name: pageName,
    },
    fetchPolicy: "cache-and-network",
  });

  return data ? <PageHistoryMain data={data} /> : <React.Fragment />;
}
