import { UnControlled as CodeMirrorComponent } from 'react-codemirror2';
import CodeMirror, { Hint } from 'codemirror';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/hint/show-hint';
import { HintFunction } from 'codemirror';
import { useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';

import styles from "./PageEditor.module.scss";

interface PageEditorProps {
  initialValue: string;
  onChange(newValue: string): void;
  onSave(): void;
}

const pageTitleCompletionsListQuery = gql`
  query pageTitleCompletionsList {
    pageTitleCompletions
  }
`;

export default function PageEditor({
  initialValue,
  onChange,
  onSave
}: PageEditorProps) {
  const client = useApolloClient();
  const hint: HintFunction = useCallback(async (cm, options) => {
    const cursor = cm.getCursor();
    const line = cm.getDoc().getLine(cursor.line);
    let startOfLinkIndex = cursor.ch;
    for (; startOfLinkIndex > 0 && line.charAt(startOfLinkIndex) !== '['; startOfLinkIndex--);
    if (startOfLinkIndex < 0) {
      // Could not find start of Wiki link.
      return null;
    } else {
      const start = startOfLinkIndex + 1;
      const end = cursor.ch;
      const searchText = line.substring(start, end);
      const { data } = await client.query({
        query: pageTitleCompletionsListQuery
      });
      const options: string[] = data.pageTitleCompletions;
      const filteredOptions = options.filter((o) => o.toLowerCase().includes(searchText.toLowerCase()));
      const finalHints: Hint[] = filteredOptions.map((o) => ({
        text: o,
        hint(cm, data, completion) {
          // Inspiration from CodeMirror here:
          // https://github.com/codemirror/CodeMirror/blob/70c615c5ff7d25e91dd50190945ef295b9ce7f09/addon/hint/show-hint.js#L99
          cm.replaceRange(
            completion.text + ']]',
            completion.from || data.from,
            completion.to || data.to,
            "complete"
          );
        }
      }));
      return {
        list: finalHints,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end),
      }
    }
  }, [client]);

  return (
    <div className={styles.main}>
      <CodeMirrorComponent
        value={initialValue}
        options={{
          mode: 'markdown',
          autofocus: true,
          viewportMargin: Infinity, // Autoexpand
          extraKeys: {
            "Cmd-S": () => {
              onSave();
            }
          },
          hintOptions: {
            hint,
            closeCharacters: /]/
          }
        }}
        onChange={(editor, data, value) => {
          // https://stackoverflow.com/a/32635597
          const cursor = editor.getCursor();
          const line = editor.getDoc().getLine(cursor.line);
          const toMatch = '[[';
          const toTest = line.substr(Math.max(cursor.ch - toMatch.length, 0), toMatch.length);
          const isMatch = toMatch === toTest;
          if (isMatch) {
            editor.showHint();
          }

          onChange(value);
        }} />
    </div>
  );
}
