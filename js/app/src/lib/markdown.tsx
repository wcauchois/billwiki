import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import { wikiLinkPlugin } from "remark-wiki-link";
import rehype2react from "rehype-react";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface WikiLinkOptions {
  permalinks?: string[];
  pageResolver?(pageName: string): string[];
  hrefTemplate?(permalink: string): string;
}

export function convertMarkdownToComponent(mdText: string) {
  const wikiLinkOptions: WikiLinkOptions = {
    pageResolver: (pageName) => [pageName.replace(/ /g, "_")],
    hrefTemplate: (permalink) => `/wiki/${permalink}`,
  };

  return unified()
    .use(markdown)
    .use(wikiLinkPlugin, wikiLinkOptions)
    .use(remark2rehype)
    .use(rehype2react, {
      createElement: React.createElement,
      components: {
        a: (props) => (
          <Link to={props.href as string}>{props.children as any}</Link>
        ),
      },
    })
    .processSync(mdText).result as ReactNode;
}
