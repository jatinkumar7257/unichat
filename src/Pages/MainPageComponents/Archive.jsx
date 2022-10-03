import React, { useState, useEffect, useContext } from "react";

// Import Components
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Skeleton
} from "@mui/material";

// Import Icons
import { Search } from "@mui/icons-material";

// Import routes
import { useNavigate } from "react-router-dom";

// Import User List Item
import UserListItem from './UserListItem';

// Import Authentication Context
import { AuthContext } from "../../context/AuthContext";

// Import Chat Context
import { ChatContext } from "../../context/ChatContext";

// Import Firebase Components
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const Favorite = () => {

  // React Navigate hook
  const navigate = useNavigate();

  // For Current Chat Drawer
  const handleOpenCurrentChat = (friendId, u) => {
    navigate(`/direct/${friendId}`);
    dispatch({ type: "CHANGE_USER", payload: u });
  }

  const [chats, setChats] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        
        const archiveChats = Object.entries(doc.data()).filter((chat) => {
          return chat[1].archive === true;
        });

        setChats(archiveChats);
        setDataLoaded(true);
      });

      return () => {
        unsub();
      };
    };

    currentUser.uid && getChats();
  }, [currentUser.uid]);

  return (
    <>
      <Box
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 1,
        }}
      >
        <Typography component="h6" variant="h5">
          tryApp
        </Typography>
      </Box>
      <Box
        component="div"
        sx={{
          width: "100%",
          height: "38px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f2f2f2",
          borderRadius: "5px",
          mt: 2,
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
            pt: 0.5,
            pl: 1,
            border: "none",
            outline: "none",
          }}
        />
        <Search />
      </Box>
      <Box component="div">
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {
            (!dataLoaded) ?
              (
                [0, 1, 2, 3, 4, 5].map((key) => (
                  <ListItem
                    sx={{
                      paddingLeft: "0px",
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}
                    key={key}
                  >
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={45} height={45} />
                    </ListItemAvatar>
                    <Skeleton variant="rounded" width={400} height={60} />
                  </ListItem>
                ))
              ):
                (
                  chats &&
                    chats?.map((chat) => (
                      <UserListItem key={chat[0]} chatDetails={chat[1]} handleOpenCurrentChat={handleOpenCurrentChat} />
                    ))
                )
          }
        </List>
      </Box>

      {/* This box is used to prevent hiding of above listitem behind the fixed */}
      <Box component="div" sx={{ width: "100%", height: "50px" }} />
    </>
  );
};

export default Favorite;
