import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import style from './index.less';

export default class Codemirror extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      codeMirrorProps: { value },
    } = props;
    this.editor = null;
    this.state = {
      code: value || '',
    };
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { code } = this.state;
    const {
      codeMirrorProps: { value },
    } = nextProps;
    if (code !== value) {
      this.setState({ code: value });
    }
  }

  render() {
    const { codeMirrorProps = {}, fetchCodeMirror = e => e } = this.props;
    const { options = {} } = codeMirrorProps;
    const initProps = {
      autoScroll: true,
      className: style['hzero-codemirror'],
      ...codeMirrorProps,
      value: this.state.code,
      options: {
        lineNumbers: true,
        mode: 'yaml',
        autoFocus: true,
        cursorHeight: 0.85,
        viewportMargin: Infinity,
        ...options,
      },
    };
    return (
      <CodeMirror
        {...initProps}
        onBeforeChange={(editor, data, value) => {
          this.setState({ code: value });
        }}
        editorDidMount={editor => {
          fetchCodeMirror(editor);
          this.editor = editor;
          editor.setSize('auto', '500px');
        }}
      />
    );
  }
}
