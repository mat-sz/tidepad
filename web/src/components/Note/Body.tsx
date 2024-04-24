import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { findAndReplace } from 'mdast-util-find-and-replace';
import { Root } from 'mdast';

import { Embed } from './Embed';
import { tryParse } from '../../helpers';

const markdownChecked = '- [x]';
const markdownUnchecked = '- [ ]';

interface Props {
  body: string;
  setBody?: (body: string) => void;
}

function cleanProps(props: any): any {
  const newProps: any = { ...props };
  delete newProps['index'];
  delete newProps['ordered'];
  delete newProps['sourcePosition'];
  delete newProps['node'];

  return newProps;
}

function betterBreaks() {
  return (tree: Root) => {
    findAndReplace(tree, [/\r?\n(\r?\n)+/g, '\n&nbsp;\n']);
  };
}

export const Body: React.FC<Props> = ({ body, setBody }) => {
  const taskListComponents: Components = !setBody
    ? {}
    : {
        li: props => {
          const liProps = cleanProps(props);

          if (props.className === 'task-list-item') {
            const pos = props.node!.position!;
            if (!pos) {
              return;
            }

            const toggle = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              const lineIndex = pos.start.line - 1;
              const lines = body.split('\n');
              const checked = lines[lineIndex].includes(markdownChecked);
              const find = checked ? markdownChecked : markdownUnchecked;
              const replace = checked ? markdownUnchecked : markdownChecked;
              lines[lineIndex] = lines[lineIndex].replace(find, replace);
              setBody?.(lines.join('\n'));
            };

            liProps.children = (
              <label onClick={toggle}>{liProps.children}</label>
            );
          }

          return <li {...liProps}>{liProps.children}</li>;
        },
        input: props => {
          const inputProps = cleanProps(props);
          if (inputProps.type === 'checkbox') {
            inputProps.disabled = false;
            inputProps.readOnly = true;
          }

          return <input {...inputProps} />;
        },
      };

  const components: Components = {
    ...taskListComponents,
    a: props => {
      const aProps = cleanProps(props);

      return (
        <a
          {...aProps}
          rel="noopener noreferrer"
          target="_blank"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          {props.children}
        </a>
      );
    },
    pre: props => {
      if (!props.node) {
        return;
      }

      const codeNode = props.node.children.find(
        child => child.type === 'element' && child.tagName === 'code'
      );

      const codeClassName = (codeNode as any)?.properties?.className;
      if (
        codeClassName &&
        Array.isArray(codeClassName) &&
        codeClassName[0] === 'language-embed'
      ) {
        const data = (codeNode as any)?.children
          ?.filter(
            (child: any) =>
              typeof child === 'object' && typeof child.value === 'string'
          )
          .map((child: any) => child.value)
          .join('\n')
          ?.trim();
        const embed = tryParse(data);

        if (embed) {
          return <Embed embed={embed} />;
        }
      }

      return <pre {...cleanProps(props)}></pre>;
    },
  };

  return (
    <div>
      <ReactMarkdown
        children={body}
        components={components}
        remarkPlugins={[betterBreaks, remarkBreaks, remarkGfm]}
      />
    </div>
  );
};
