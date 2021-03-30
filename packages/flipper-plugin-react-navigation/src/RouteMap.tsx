import * as React from 'react';
import { styled } from 'flipper';

const indigo = '#3F51B5';
const teal = '#009688';
const pink = '#E91E63';

export default function RouteMap({ routes, root = true }) {
  return (
    <Container
      style={{
        ...(root
          ? { overflowX: 'auto', padding: 'calc(var(--ifm-pre-padding) / 2)' }
          : null),
      }}
    >
      {routes.map((route, i) => (
        <Item key={route.name}>
          <Route>
            <Name>
              {route.name}
              {root ? null : i === 0 ? <ConnectLeft /> : <ConnectUpLeft />}
            </Name>
            {route.params ? (
              <ParamsContainer>
                <Params>
                  <tbody>
                    {Object.entries(route.params).map(([key, value]) => (
                      <Row key={key}>
                        <Key>{key}</Key>
                        <Separator>:</Separator>
                        <Value>{JSON.stringify(value)}</Value>
                      </Row>
                    ))}
                  </tbody>
                </Params>
                <ConnectUp />
              </ParamsContainer>
            ) : null}
          </Route>
          {route.state ? (
            <RouteMap routes={route.state.routes} root={false} />
          ) : null}
        </Item>
      ))}
    </Container>
  );
}

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const Item = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
});

const Route = styled.div({
  minWidth: 160,
});

const Name = styled.div({
  backgroundColor: indigo,
  color: 'white',
  fontSize: 'var(--ifm-code-font-size)',
  margin: 'calc(var(--ifm-pre-padding) / 2)',
  padding: 'calc(var(--ifm-pre-padding) / 2) var(--ifm-pre-padding)',
  borderRadius: 4,
  position: 'relative',
  textAlign: 'center',
});

const ParamsContainer = styled.div({
  position: 'relative',
});

const Params = styled.table({
  backgroundColor: 'rgba(3, 169, 244, 0.08)',
  border: `1px solid ${indigo}`,
  fontFamily: 'var(--ifm-font-family-monospace)',
  fontSize: 'var(--ifm-code-font-size)',
  margin: 'var(--ifm-pre-padding) calc(var(--ifm-pre-padding) / 2)',
  borderRadius: 4,
  padding: 3,
  width: 'auto',
  overflow: 'visible',
});

const Row = styled.tr({
  border: 0,
  background: 'none',
});

const Key = styled.td({
  color: teal,
  border: 0,
  padding: '4px 6px',
  textAlign: 'right',
});

const Value = styled.td({
  color: pink,
  padding: '4px 6px',
  border: 0,
});

const Separator = styled.td({
  color: 'inherit',
  opacity: 0.3,
  border: 0,
  padding: 0,
});

const ConnectLeft = styled.div({
  position: 'absolute',
  width: 16,
  height: 1,
  backgroundColor: indigo,
  right: '100%',
  top: '50%',
});

const ConnectUpLeft = styled.div({
  position: 'absolute',
  width: 9,
  height: 52,
  border: `1px solid ${indigo}`,
  borderRadius: '0 0 0 3px',
  borderRight: 0,
  borderTop: 0,
  right: '100%',
  bottom: '50%',
});

const ConnectUp = styled.div({
  position: 'absolute',
  width: 1,
  height: 16,
  backgroundColor: indigo,
  right: '50%',
  bottom: '100%',
});
