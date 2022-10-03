import React, { useState, useEffect } from "react";
// Import Components
import {
  Box,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  styled,
  Alert,
  CircularProgress,
  Stack
} from "@mui/material";

// Import Icons
import { Search, CloseOutlined } from "@mui/icons-material";

// Import ProTypes from Material UI
import PropTypes from "prop-types";

// Import routes
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./../../firebase";

// Start Material UI Dialog
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseOutlined />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

// End Material UI Dialog

const InviteFriend = (props) => {

  // React Navigate hook
  const navigate = useNavigate();

  // Handle close Invite Friend Dialog
  const handleCloseDialog = () => {
    props.setOpenDialog(false);
  };

  // Handle Search
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false); //use to check loading of data

  const handleSearch = async () => {
    setLoading(true);
    const q = query(
      collection(db, "users"),
      where("displayName", "==", username)
    );
   try {
     const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
     if (querySnapshot.docs.length == 0) {
       setLoading(false);
       setErr(true);
       setUser(false);
     } else {
       setLoading(false);
       setErr(false);
     }
    } catch {}
  }

  const viewProfile = (searchedUserId) => {
    navigate(`profile/${searchedUserId}`)
  }

  const keyDownHandler = (event) => {

    if (event.key === 'Enter') {
      event.preventDefault();

      // 👇️ call submit function here
      handleSearch()
    }
  };
  return (
    <div>
      <BootstrapDialog
        onClose={handleCloseDialog}
        aria-labelledby="customized-dialog-title"
        open={props.openDialog}
        maxWidth="100%"
        sx={{ p: 0, m: 0 }}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleCloseDialog}
        >
          Invite Friend
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Box
            component="div"
            sx={{
              width: "100%",
              height: "45px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#f2f2f2",
              borderRadius: "5px",
            }}
          >
            <TextField
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              id="filled-search"
              placeholder="Search here..."
              type="text"
              sx={{
                width: "85%",
                height: "100%",
                pt: 1,
                pl: 1,
                border: "none",
                outline: "none",
              }}
              onKeyDown={(event) => keyDownHandler(event)}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Search onClick={handleSearch} />
          </Box>
          <List
            sx={{ width: "100%", bgcolor: "background.paper" }}
          >
            {
              loading ?
                (<Stack direction="row" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Stack>)
                :
                (user ?
                  (<ListItem button alignItems="center" sx={{ paddingLeft: "0px" }}
                  onClick={() => viewProfile(user.uid)}>
                    <ListItemAvatar>
                      <Avatar alt={user.displayName} src={user.photoURL} />
                    </ListItemAvatar>
                    <ListItemText primary={user.displayName} />
                  </ListItem>)
                  :
                  (err &&
                  <Alert severity="info" variant="standard" style={{ "textAlign": "center" }}>
                    user not found.
                  </Alert>)
                )
            }
          </List>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
};

export default InviteFriend;
