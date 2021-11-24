export function pageLink(pageName: string) {
  return `/wiki/${pageName.replace(/ /g, "_")}`;
}
