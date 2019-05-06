import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
// import Helmet from 'react-helmet';
import Loadable from 'react-loadable';
// import { getBundles } from 'react-loadable/webpack';

import App from '../src/App';
import configureStore from '../src/utils/configureStore';
import { fetchDataForRender } from './fetchDataForRender';
// import { indexHtml } from './indexHtml';
// import stats from '../build/react-loadable.json';

export const renderServerSideApp = (req, res) => {
  const store = configureStore(undefined, { logger: false });

  Loadable.preloadAll()
    .then(() => fetchDataForRender(req, store))
    .then(() => renderApp(req, res, store));
};

function renderFullPage(html, preloadedState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // WARNING: See the following for security issues around embedding JSON in HTML:
          // http://redux.js.org/recipes/ServerRendering.html#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState)}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `;
}

function renderApp(req, res, store) {
  const context = {};
  const modules = [];
  const preloadedState = store.getState();
  const markup = ReactDOMServer.renderToString(
    <Loadable.Capture report={moduleName => modules.push(moduleName)}>
      <Provider store={store}>
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      </Provider>
    </Loadable.Capture>
  );
  console.log(store.getState(), 'bkhj');
  if (context.url) {
    res.redirect(context.url);
  } else {
    // const fullMarkup = indexHtml({
    //   helmet: Helmet.renderStatic(),
    //   initialState: store.getState(),
    //   bundles: getBundles(stats, modules),
    //   markup
    // });

    res.send(renderFullPage(markup, preloadedState));
    // res.send(markup, preloadedState);
  }
}
