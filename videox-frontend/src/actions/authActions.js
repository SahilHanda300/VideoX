import * as api from "../api";
import { openAlertMessage } from "./alertActions";
export const authActions = {
  SET_USER_DETAILS: "AUTH.SET_USER_DETAILS",
};

export const getActions = (dispatch) => {
  return {
    login: (userDetails, navigate) => {
      dispatch(login(userDetails, navigate));
    },
    register: (userDetails, navigate) => {
      dispatch(register(userDetails, navigate));
    },
  };
};

const setUserDetails = (userDetails) => {
  return {
    type: authActions.SET_USER_DETAILS,
    userDetails,
  };
};

const login = (userDetails, navigate) => async (dispatch) => {
  const response = await api.login(userDetails);
  console.log(response);

  if (response.error) {
    dispatch(openAlertMessage(response.exception.response.data));
  } else {
    const { userDetails } = response.data;
    localStorage.setItem("user", JSON.stringify(userDetails));
    if (response.error) {
      // show alert instead of navigating
      console.error(
        "Login failed:",
        response.exception?.response?.data || response.exception?.message
      );
      return;
    }
    dispatch(setUserDetails(userDetails));
    navigate("/dashboard");
  }
};

const register = (userDetails, navigate) => async (dispatch) => {
  const response = await api.register(userDetails);
  console.log(response);

  if (response.error) {
    dispatch(openAlertMessage(response.exception.response.data));
  } else {
    const { userDetails } = response.data;
    localStorage.setItem("user", JSON.stringify(userDetails));
    dispatch(setUserDetails(userDetails));
    navigate("/dashboard");
  }
};
