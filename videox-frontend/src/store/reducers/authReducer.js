// Reducer for authentication state
import { authActions } from "../../actions/authActions";

const initState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case authActions.LOGIN_SUCCESS:
      return { ...state, user: action.payload };
    case authActions.LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default authReducer;
