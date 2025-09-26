import { Typography } from "@mui/material";
import { connect } from "react-redux";
// Displays the name of the chosen chat conversation
const ChosenOptionLabel = ({ name }) => {
  return (
    <Typography sx={{ color: "white", fontWeight: "bold" }}>
      {`${name ? `Chosen Conversation ${name}` : ""}`}
    </Typography>
  );
};

const mapStateToProps = (state) => {
  return {
    // Get chat name from Redux state
    name: state.chat.chosenChatDetails?.name,
  };
};
export default connect(mapStateToProps)(ChosenOptionLabel);
