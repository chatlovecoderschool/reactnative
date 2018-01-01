/**
 * Login Reducer
 */

// Set initial state
const initialState = {};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'USER_REGISTER': {
      return {};
    }
    case 'USER_LOGIN': {
      if (action.data) {
        const input = action.data;
        return {
          ...state,
          email: input.email
        };
      }
      return {};
    }
    default:
      return state;
  }
}
