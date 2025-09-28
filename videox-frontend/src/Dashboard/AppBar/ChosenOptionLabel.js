import { Typography } from "@mui/material";
import { connect } from "react-redux";

const ChosenOptionLabel = ({ name }) => {
  return (
    <Typography sx={{ color: "white", fontWeight: "bold" }}>
      {`${name ? `Chosen Conversation ${name}` : ""}`}
    </Typography>
  );
};

const mapStateToProps = (state) => {
  return {
    name: state.chat.chosenChatDetails?.name,
  };
};
export default connect(mapStateToProps)(ChosenOptionLabel);
