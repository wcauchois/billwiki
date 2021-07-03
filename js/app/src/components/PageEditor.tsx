import { UnControlled as CodeMirrorComponent } from 'react-codemirror2';
import CodeMirror from 'codemirror';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/hint/show-hint';
import { HintFunction } from 'codemirror';
import { useCallback } from 'react';

interface PageEditorProps {
  initialValue: string;
}

export default function PageEditor({
  initialValue
}: PageEditorProps) {
  const hint: HintFunction = useCallback((cm, options) => {
    const cursor = cm.getCursor();
    return {
      list: ['hi', 'you'],
      from: CodeMirror.Pos(cursor.line),
      to: CodeMirror.Pos(cursor.line),
    }
  }, []);

  return (
    <div>
      <CodeMirrorComponent
        value={initialValue}
        options={{
          mode: 'markdown',
          extraKeys: {
            "Ctrl-Space": "autocomplete"
          },
          hintOptions: {
            hint
          }
        }}
        onChange={(editor, data, value) => {

        }} />
    </div>
  );
}

/*
import React from 'react';
import { WidgetProps } from '@rjsf/core';
import { Controlled as CodeMirror } from 'react-codemirror2';

require('codemirror/mode/css/css');

export default function CssCodeWidget({ value, onChange, label }: WidgetProps) {
  return (
    <div className="field">
      <label>{label}</label>
      <CodeMirror
        value={value}
        onBeforeChange={(editor, data, value) => onChange(value)}
        options={{
          mode: 'css',
          lineNumbers: true,
        }}
        onChange={(editor, data, value) => {}}
      />
    </div>
  );
}
*/