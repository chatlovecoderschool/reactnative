import { combineReducers, createStore, applyMiddleware } from 'redux'
import { logger } from 'redux-logger'
import promiseMiddleware from 'redux-promise-middleware'
import thunk from 'redux-thunk'

const connection = (state = { connected: false, user: null }, action) => {
  console.log(state)
  switch (action.type) {
    case 'CONNECTION_PENDING':
      return { connected: false, user: null }
    case 'CONNECTION_FULFILLED':
      return { connected: true, user: action.payload }
    case 'CONNECTION_STARTED':
      return { connected: false, user: null }
    case 'CONNECTION_COMPLETED':
      return { connected: true, user: action.payload }
    default:
      return state
  }
}

const reducers = combineReducers({
  connection
})

const middleware = applyMiddleware(
  thunk,
  promiseMiddleware(),
  logger
)

export default createStore(reducers, middleware)
