import React from 'react'
import ReactDOM from 'react-dom'
import WithMuiTheme from './withMuiTheme'
import App from './App'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <WithMuiTheme>
    <App />
  </WithMuiTheme>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

if (module.hot) {
  module.hot.accept()
}
