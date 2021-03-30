import * as React from 'react';
import Editor from 'react-simple-code-editor';
import { styled } from 'flipper';
import { getStateFromPath, getActionFromState } from '@react-navigation/core';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import github from 'prism-react-renderer/themes/github';
import RouteMap from './RouteMap';
import * as fonts from './fonts';

// eslint-disable-next-line no-eval
const parse = (value: string) => eval(`(function() { return ${value}; }())`);

function CodePreview({ code, language }: { code: string; language: Language }) {
  return (
    <Highlight {...defaultProps} code={code} theme={github} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <JSONPre className={className} style={style}>
          {tokens.map((line, i) => (
            // eslint-disable-next-line react/jsx-key
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                // eslint-disable-next-line react/jsx-key
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </JSONPre>
      )}
    </Highlight>
  );
}

export function LinkingTester() {
  const [rawConfig, setRawConfig] = React.useState(
    `{
  screens: {
    Home: {
      initialRouteName: 'Feed',
      screens: {
        Profile: {
          path: 'user/:id',
          parse: {
            id: id => id.replace(/^@/, ''),
          },
          screens: {
            Settings: 'edit',
          },
        },
      },
    },
    NoMatch: '*',
  }
}`
  );

  const [path, setPath] = React.useState('/user/@vergil/edit');
  const [config, setConfig] = React.useState(() => parse(rawConfig));
  const [pane, setPane] = React.useState('chart');

  let state, action;

  try {
    state = getStateFromPath(path.replace(/(^\w+:|^)\/\//, ''), config);
    action = state ? getActionFromState(state, config) : undefined;
  } catch (e) {
    // Ignore
  }

  return (
    <>
      <CodeInput
        type="text"
        value={path}
        placeholder="Type a path, e.g. /user/@vergil/edit"
        onChange={(e) => setPath(e.target.value)}
      />
      <CodeEditor
        value={rawConfig}
        placeholder="Type linking config"
        onValueChange={(value) => {
          setRawConfig(value);

          try {
            const config = parse(value);

            setConfig(config);
          } catch (e) {
            // Ignore
          }
        }}
        highlight={(code) => (
          <Highlight {...defaultProps} code={code} language="jsx">
            {({ tokens, getLineProps, getTokenProps }) =>
              tokens.map((line, i) => (
                // eslint-disable-next-line react/jsx-key
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    // eslint-disable-next-line react/jsx-key
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))
            }
          </Highlight>
        )}
        padding={16}
      />
      <PreviewPane>
        <ToggleButtonRow>
          <ToggleButton type="button" onClick={() => setPane('chart')}>
            Chart
          </ToggleButton>
          <ToggleButton type="button" onClick={() => setPane('state')}>
            State
          </ToggleButton>
          <ToggleButton type="button" onClick={() => setPane('action')}>
            Action
          </ToggleButton>
        </ToggleButtonRow>
        {pane === 'state' ? (
          <CodePreview
            code={JSON.stringify(state, null, 2) || ''}
            language="json"
          />
        ) : pane === 'action' ? (
          <CodePreview
            code={JSON.stringify(action, null, 2) || ''}
            language="json"
          />
        ) : pane === 'chart' ? (
          state ? (
            <RouteMap routes={state.routes} />
          ) : (
            <ErrorDescription>
              Failed to parse the path. Make sure that the path matches the
              patterns specified in the config.
            </ErrorDescription>
          )
        ) : null}
      </PreviewPane>
    </>
  );
}

const CodeInput = styled.input({
  display: 'block',
  width: '100%',
  fontFamily: fonts.monospace,
  fontSize: 12,
  borderRadius: 3,
  padding: 16,
  margin: '16px 0',
  color: 'inherit',
  border: '1px solid rgba(0, 0, 0, 0.1)',
});

const CodeEditor = styled(Editor)({
  display: 'block',
  fontFamily: fonts.monospace,
  fontSize: 12,
  borderRadius: 3,
  margin: '16px 0',
  border: '1px solid rgba(0, 0, 0, 0.1)',
});

const PreviewPane = styled.div({
  position: 'relative',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 3,
  minHeight: 70,
});

const ToggleButtonRow = styled.div({
  position: 'absolute',
  flexDirection: 'row',
  right: 0,
  top: 0,
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
});

const ToggleButton = styled.button({
  border: 0,
  borderLeft: '1px solid  rgba(0, 0, 0, 0.1)',
  borderRadius: 0,
  cursor: 'pointer',
  display: 'inline-flex',
  fontSize: 12,
  margin: 0,
  padding: '4px 8px',
  color: 'inherit',
  background: 'none',
  MozAppearance: 'none',
  WebkitAppearance: 'none',
});

const ErrorDescription = styled.p({
  margin: 24,
  color: '#A12027',
});

const JSONPre = styled.pre({
  margin: 0,
  fontFamily: fonts.monospace,
  fontSize: 12,
  borderRadius: 3,
  padding: 16,
  minHeight: 70,
});
