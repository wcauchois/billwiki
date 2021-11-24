import { useState } from "react";
import { useHistory } from "react-router-dom";
import { pageLink } from "../lib/links";
import { useUpdatePage } from "../lib/mutations";
import PageEditor from "./PageEditor";
import Button from "./system/Button";
import TextInput from "./system/TextInput";
import TopBar from "./system/TopBar";

export default function NewPage() {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [content, setContent] = useState("");
  const history = useHistory();

  const [updatePage] = useUpdatePage();

  const savePage = () => {
    if (title.length === 0) {
      setTitleError(true);
      return;
    }

    async function doSave() {
      try {
        await updatePage({
          variables: {
            input: {
              name: title,
              content,
            },
          },
        });
        history.push(pageLink(title));
      } catch (err) {
        console.error(err);
      }
    }
    doSave();
  };

  return (
    <div>
      <TopBar title="New page" />
      <div className="flex flex-col">
        <div className="flex mb-4">
          <TextInput
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.currentTarget.value);
              setTitleError(false);
            }}
            error={titleError}
          />
        </div>
        <div>
          <PageEditor
            initialValue=""
            onChange={(newContent) => setContent(newContent)}
            onSave={() => {}}
          />
        </div>
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
    </div>
  );
}
