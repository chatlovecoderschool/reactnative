import { Provider } from 'react-redux'
import React from 'react'
import store from './store'
import Route from './Router'

class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Route />
      </Provider>
    )
  }
}

export default App
