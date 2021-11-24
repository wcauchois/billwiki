import { useState } from "react";
import PageEditor from "./PageEditor";
import Button from "./system/Button";
import TextInput from "./system/TextInput";

export default function NewPage() {
  const [content, setContent] = useState("");

  const savePage = () => {};

  return (
    <div className="flex flex-col">
      <div className="flex mb-4">
        <TextInput placeholder="Title" />
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
  );
}
