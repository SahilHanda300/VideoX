import { authActions } from "../../actions/authActions";

const initState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case authActions.LOGIN_SUCCESS:
      return { ...state, user: action.userDetails || action.payload };
    case authActions.SET_USER_DETAILS:
      return { ...state, user: action.userDetails };
    case authActions.LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default authReducer;
