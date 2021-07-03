import unified from "unified";
import markdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";

export function convertMarkdownToHtml(mdText: string) {
  return unified()
    .use(markdown)
    .use(remark2rehype)
    .use(html)
    .processSync(mdText)
    .toString();
}
