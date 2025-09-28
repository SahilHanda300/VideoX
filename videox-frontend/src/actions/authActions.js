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
    setUserDetails: (userDetails) => {
      dispatch(setUserDetails(userDetails));
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
  try {
    const response = await api.login(userDetails);
    console.log(response);

    if (response.error) {
      dispatch(
        openAlertMessage(
          response.exception?.response?.data?.message ||
            response.exception?.response?.data ||
            "Login failed"
        )
      );
      return false; 
    } else {
      const { userDetails } = response.data;
      localStorage.setItem("user", JSON.stringify(userDetails));
      dispatch(setUserDetails(userDetails));
      navigate("/dashboard");
      return true;
    }
  } catch (error) {
    dispatch(openAlertMessage("An error occurred during login"));
    return false;
  }
};

const register = (userDetails, navigate) => async (dispatch) => {
  const response = await api.register(userDetails);
  console.log(response);

  if (response.error) {
    dispatch(
      openAlertMessage(
        response.exception?.response?.data?.message ||
          response.exception?.response?.data ||
          "Registration failed"
      )
    );
  } else {
    const { userDetails } = response.data;
    localStorage.setItem("user", JSON.stringify(userDetails));
    dispatch(setUserDetails(userDetails));
    navigate("/dashboard");
  }
};
