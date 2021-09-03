import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import { wikiLinkPlugin } from "remark-wiki-link";
import rehype2react from "rehype-react";
import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import Header from "../components/system/Header";
import rehypeHighlight from "rehype-highlight";

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
    .use(rehypeHighlight as any)
    .use(rehype2react, {
      createElement: React.createElement,
      components: {
        a: (props: any) => <Link to={props.href}>{props.children}</Link>,
        h1: (props: any) => <Header level={1}>{props.children}</Header>,
        h2: (props: any) => <Header level={2}>{props.children}</Header>,
        h3: (props: any) => <Header level={3}>{props.children}</Header>,
        h4: (props: any) => <Header level={4}>{props.children}</Header>,
      },
    })
    .processSync(mdText).result as ReactNode;
}
