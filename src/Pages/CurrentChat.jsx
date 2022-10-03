import React, { useState, useEffect, useContext, useRef } from "react";

// Import Components
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  TextField,
  Typography,
  Paper,
  Stack,
  Skeleton,
  SwipeableDrawer,
  Grow,
  Snackbar
} from "@mui/material";

// Import Icons
import {
  Send,
  MoreHorizOutlined,
  NavigateBefore,
  InsertDriveFile,
  CameraAlt,
  Collections,
  MoreVert,
} from "@mui/icons-material";

// Import navigate
import { useNavigate, useParams } from "react-router-dom";

// Import Background Image
import Image from "./../assets/pattern-05.png";

// Import Messages Component
import Messages from "./MainPageComponents/Messages";

// Import Simple Snack
import SimpleSnack from "./MainPageComponents/SimpleSnack";

// Import Authentication Context
import { AuthContext } from "./../context/AuthContext";

// Import Chat Context
import { ChatContext } from "./../context/ChatContext";

// Import Firebase Components
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "./../firebase";
import { v4 as uuid } from "uuid";

const CurrentChat = () => {

  // React Navigate Hook
  const navigate = useNavigate();

  // get friendId from URL
  const { friendId } = useParams();

  // ? Current Chat States:

  // Sending Message
  const [messages, setMessages] = useState([]);
  const newMessage = useRef(); // ? use for sending message

  // For Checking all data loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // For drawer
  const [openCurrentChat, setOpenCurrentChat] = useState(false);

  // To Always Chat Drawer
  useEffect(() => {
    setOpenCurrentChat(true);
  }, [navigate]);

  // Handle Closing Chat Drawer
  const handleCloseCurrentChat = () => {
    setOpenCurrentChat(false);
    navigate(-1);
  };

  // More menu toggle
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Closing more menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Use AuthContext
  const { currentUser } = useContext(AuthContext);

  // Use ChatContext
  const { data, dispatch } = useContext(ChatContext);

  // Set Current Chat Friend Using URL Param ID
  const [user, setUser] = useState([]);

  // Set Image Attachment
  const [img, setImg] = useState(null);

  // Set Image Upload Progress
  const [percent, setPercent] = useState(0);

  // Snackbar Handle
  const [SimpleSnacking, setSimpleSnacking] = useState({
    open: false,
    message: '',
    snackType: 'error'
  });

  // Toggle Send Message Button
  const [toggleSendButton, setToggleSendButton] = useState()

  // Page Refresh (Getting Friend Details)
  useEffect(() => {

    const getUserDetails = async () => {
      const q = query(
        collection(db, "users"),
        where("uid", "==", friendId)
      );
      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setUser(doc.data());
        });
        setDataLoaded(true);
      } catch (err) {
        console.log(err);
      }
    }
    getUserDetails()
  }, [friendId])

  // Page Refresh (Setting Chat Context)
  useEffect(() => {
    dispatch({ type: "CHANGE_USER", payload: user });
  }, [user.uid]);

  // Page Refresh (Getting Messages)
  useEffect(() => {

    const chatId =
      currentUser.uid > friendId
        ? currentUser.uid + friendId
        : friendId + currentUser.uid;

    const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });
    return () => {
      unSub();
    }
  }, [currentUser.uid, dispatch]);

  // Redirect to Profile
  const viewProfile = (userId) => {
    navigate(`/profile/${userId}`)
  }

  // Add to favorite friend List
  const addToFavoriteFriend = async () => {

    // Set the "archive" field of the userChats 'true'
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".favorite"]: true,
    });

    setSimpleSnacking({
      open: true,
      message: "User added to favorite friend",
      snackType: "user added"
    });

    setAnchorEl(null);

  }

  // Archive friend
  const addToArchiveFriend = async () => {

    // Set the "archive" field of the userChats 'true'
    await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".archive"]: true,
    });

    setSimpleSnacking({
      open: true,
      message: "User added to archive friend",
      snackType: 'user added'
    });

    setAnchorEl(null);

  }

  // send message
  const handleSendMessage = async () => {
    const combinedId =
      currentUser.uid > friendId
        ? currentUser.uid + friendId
        : friendId + currentUser.uid;

    const text = newMessage.current.value;

    // Clearing Values
    setImg(null);
    newMessage.current.value = "";
    setToggleSendButton(false);
    
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", data.chatId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".favorite"]: false,
          [combinedId + ".archive"]: false,
        });


        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
          [combinedId + ".favorite"]: false,
          [combinedId + ".archive"]: false,
        });

      }

      if (img) {
        
        const storageRef = ref(storage, uuid());
        
        // progress can be paused and resumed. It also exposes progress updates.
        // Receives the storage reference and the file to upload.
        const uploadTask = uploadBytesResumable(storageRef, img);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const percent = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
 
                // update progress
                setPercent(percent);
            },
            (err) => console.log(err),
            () => {
                // download url
                getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
                  await updateDoc(doc(db, "chats", data.chatId), {
                    messages: arrayUnion({
                      id: uuid(),
                      text: newMessage.current.value,
                      senderId: currentUser.uid,
                      date: Timestamp.now(),
                      img: downloadURL,
                    }),
                  });
                });
            }
        );

      } else {
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
          }),
        });
      }

      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
          id: currentUser.uid
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
          id: currentUser.uid
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });

    } catch (err) { console.log(err) }
  }

  // Attachments toggle
  const [attachment, setAttachment] = useState(false);

  const toggleAttachmentDrawer = (newOpen) => () => {
    setAttachment(newOpen);
  };

  return (
    <>
      <Paper>
        <Drawer
          anchor="right"
          open={openCurrentChat}
          PaperProps={{
            sx: { width: "100%", backgroundImage: `${dataLoaded && `url(${Image})`}`, overflow: 'hidden' },
          }}
        >
          {
            (!dataLoaded) ?
              (
                <>
                  <Paper
                    sx={{
                      width: "100%",
                      height: "74px",
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      border: "0px",
                      boxShadow: "0px 1px 1px 0px rgb(0 0 0 / 5%)",
                    }}
                  >
                    <Box
                      component="div"
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "auto",
                        px: 2,
                        border: "0px",
                      }}
                    >
                      <Skeleton variant="rounded" width={38} height={30} sx={{ mr: 2 }} />

                      <ListItem
                        sx={{
                          paddingLeft: "0px",
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ListItemAvatar>
                          <Skeleton variant="circular" width={45} height={45} />
                        </ListItemAvatar>
                        <Stack>
                          <Skeleton variant="text" width={100} height={30} />
                          <Skeleton variant="text" width={50} height={25} />
                        </Stack>
                      </ListItem>
                    </Box>
                  </Paper>

                  <Paper
                    sx={{
                      position: "fixed",
                      width: "100%",
                      top: "100px",
                      height: "81.5%",
                      background: "transparent",
                    }}
                    elevation={0}
                  >
                    <Box
                      component="div"
                      sx={{
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        overflowY: "auto",
                      }}
                    >
                      <List sx={{ width: "100%", maxWidth: "90%", mx: "auto" }}>
                        {
                          [0, 1, 2, 3].map((key) => (
                            (key % 2 != 0) ?
                              (<ListItem
                                sx={{ padding: "0px", mb: 3, display: "flex", justifyContent: "flex-end", }}
                                key={key}
                              >
                                <Box
                                  component="div"
                                  sx={{
                                    maxWidth: "90%",
                                    display: "inline-flex",
                                    position: "realtive",
                                    alignItems: "flex-end",
                                  }}
                                >
                                  <Box component="div">
                                    <Skeleton variant="rounded" width={150} height={60} />
                                    <Box sx={{
                                      width: "100%",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "flex-end"
                                    }}>
                                      <Skeleton variant="text" width={70} height={30} />
                                    </Box>
                                  </Box>
                                </Box>
                              </ListItem>)
                              :
                              (
                                <ListItem
                                  sx={{ padding: "0px", mb: 3, display: "flex" }}
                                  key={key}
                                >
                                  <Box
                                    component="div"
                                    sx={{
                                      maxWidth: "90%",
                                      display: "inline-flex",
                                      position: "realtive",
                                      alignItems: "flex-end",
                                    }}
                                  >
                                    <ListItemAvatar sx={{ minWidth: "46px" }}>
                                      <Skeleton variant="circular" width={32} height={32} />
                                    </ListItemAvatar>
                                    <Box component="div">
                                      <Skeleton variant="rounded" width={150} height={60} />
                                      <Skeleton variant="text" width={70} height={30} sx={{ display: "inline-flex", justifyItems: 'center' }} />
                                    </Box>
                                  </Box>
                                </ListItem>
                              )
                          ))
                        }
                      </List>
                    </Box>
                  </Paper>
                </>
              )
              :
              (
                <>
                  {/* Top current chat detials of current chat user */}

                  <Paper
                    sx={{
                      width: "100%",
                      height: "calc(100vh - 70px)",
                      top: 0,
                      left: 0,
                      right: 0,
                      background: 'transparent'
                    }}
                  >
                    {
                      user &&
                      (
                        <Paper
                          sx={{
                            width: "100%",
                            height: "74px",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            border: "0px",
                            boxShadow: "0px 1px 1px 0px rgb(0 0 0 / 5%)",
                            zIndex: 1100,
                          }}
                        >
                          <Box
                            component="div"
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              height: "auto",
                              px: 2,
                              border: "0px",
                            }}
                          >
                            <NavigateBefore
                              sx={{
                                ml: 1,
                                mr: 2,
                                color: "#ffffff",
                                fontSize: "30px",
                                bgcolor: "#ff784e",
                                padding: "2px 5px",
                                borderRadius: "5px",
                              }}
                              onClick={handleCloseCurrentChat}
                            />

                            <ListItem alignItems="flex-start" sx={{ paddingLeft: "0px" }}>
                              <ListItemAvatar>
                                <Avatar
                                  alt={user.displayName}
                                  src={user.photoURL}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    component="h1"
                                    variant="h5"
                                    style={{ color: "#333", fontSize: "16px" }}
                                  >
                                    {" "}
                                    {user.displayName}
                                  </Typography>
                                }
                                secondary={"offline"}
                              />
                            </ListItem>
                            <IconButton onClick={handleClick} sx={{ p: 0 }}>
                              <MoreVert />
                            </IconButton>
                            <Menu
                              id="demo-positioned-menu"
                              aria-labelledby="demo-positioned-button"
                              anchorEl={anchorEl}
                              open={openMenu}
                              onClose={handleClose}
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                            >
                              <MenuItem onClick={() => viewProfile(friendId)}>View Profile</MenuItem>
                              <MenuItem onClick={handleClose}>Clear Chat</MenuItem>
                              <MenuItem onClick={() => addToArchiveFriend()}>Archive Chat</MenuItem>
                              <MenuItem onClick={() => addToFavoriteFriend()}>Favorite Chat</MenuItem>
                            </Menu>
                          </Box>
                        </Paper>
                      )
                    }

                    {/* Messages box of current chat */}

                    <Paper
                      sx={{
                        width: "100%",
                        height: '100%',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <Box
                        component="div"
                        sx={{
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                          overflowY: "auto",
                        }}
                      >
                        <List sx={{ width: "100%", maxWidth: "90%", mx: "auto", mt: '74px', pb: 0 }}>
                          {
                            messages?.map((msg) => (
                              <Messages key={msg.id} msgDetails={msg} />
                            ))
                          }
                        </List>
                      </Box>
                    </Paper>
                  </Paper>

                  {/* Current Chat functionality */}

                  <Paper
                    sx={{
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: "flex",
                      height: "70px",
                      zIndex: 1100,
                      boxShadow: "-1px -1px 1px 0px rgb(0 0 0 / 5%)",
                    }}
                  >
                    <Box
                      component="div"
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={0}
                        alignItems="center"
                        width="95%"
                        height="100%"
                      >
                        <IconButton
                          component="label"
                          sx={{
                            color: "#666",
                            backgroundColor: "transparent",
                            width: "30px",
                            height: "100%",
                          }}
                          onClick={toggleAttachmentDrawer(true)}
                        >
                          <MoreHorizOutlined />
                        </IconButton>
                        <TextField
                          variant="standard"
                          InputProps={{
                            disableUnderline: true,
                          }}
                          id="filled-search"
                          placeholder="Type your Message"
                          multiline
                          maxRows={4}
                          type="text"
                          sx={{
                            width: "100%",
                            mx: 1,
                            pt: 0,
                            pb: 0,
                            pl: 1,
                            border: "1px solid #dbdbdb",
                            borderRadius: "5px",
                            overflowY: "auto",
                            maxHeight: "80%",
                            minHeight: "50%",
                          }}
                          inputRef={newMessage}
                          onKeyUp={() => (newMessage.current.value) ? setToggleSendButton(true) : setToggleSendButton(false)}
                        />
                        <Send
                          sx={{
                            color: (toggleSendButton ? "#f2f2f2" : "#ff784e"),
                            fontSize: "35px",
                            bgcolor: (toggleSendButton && "#ff784e"),
                            py: 0,
                            px: 0.8,
                            borderRadius: "5px",
                            border: (!toggleSendButton && "1px solid #ff784e")
                          }}
                          onClick={() => (newMessage.current.value || img) && handleSendMessage()}
                        />
                      </Stack>
                    </Box>

                    {/* Attachment div */}

                    <SwipeableDrawer
                      anchor="bottom"
                      open={attachment}
                      onClose={toggleAttachmentDrawer(false)}
                      onOpen={toggleAttachmentDrawer(true)}
                      swipeAreaWidth={10}
                      disableSwipeToOpen={false}
                      ModalProps={{
                        keepMounted: true,
                      }}
                      PaperProps={{
                        sx: {
                          borderTopLeftRadius: 15,
                          borderTopRightRadius: 15,
                        }
                      }}
                    >
                      <Box component="div" sx={{ width: '100%', height: '20px' }}>
                        <Box sx={{
                          width: 30,
                          height: 6,
                          backgroundColor: "lightgrey",
                          borderRadius: 3,
                          position: 'absolute',
                          top: 10,
                          left: 'calc(50% - 15px)',
                        }} />
                      </Box>
                      <Box component='div' sx={{ width: '100%', height: '100%', my: 3 }}>
                        <Stack direction="row" spacing={6} justifyContent="center">
                          <Box component="div" sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                            <IconButton
                              aria-label="upload picture"
                              component="label"
                              sx={{
                                color: "rgba(254,139,58,255)",
                                backgroundColor: "RGBA(255, 244, 239, 0.6)",
                                width: "48px",
                                height: "48px",
                                border: "1px solid rgba(254,139,58,255)"
                              }}
                            >
                              <input hidden accept="*" type="file" />
                              <InsertDriveFile />
                            </IconButton>
                            <Typography component="p" sx={{ fontSize: '15px', mt: 0.5 }}>Documents</Typography>
                          </Box>
                          <Box component="div" sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                            <IconButton
                              aria-label="upload picture"
                              component="label"
                              sx={{
                                color: "rgba(254,139,58,255)",
                                backgroundColor: "RGBA(255, 244, 239, 0.6)",
                                width: "48px",
                                height: "48px",
                                border: "1px solid rgba(254,139,58,255)"
                              }}
                            >
                              <input
                                hidden
                                type="file"
                                id="file"
                                onChange={(e) => setImg(e.target.files[0])}
                              />
                              <CameraAlt />
                            </IconButton>
                            <Typography component="p" sx={{ fontSize: '15px', mt: 0.5 }}>Camera</Typography>
                          </Box>
                          <Box component="div" sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}>
                            <IconButton
                              aria-label="upload picture"
                              component="label"
                              sx={{
                                color: "rgba(254,139,58,255)",
                                backgroundColor: "RGBA(255, 244, 239, 0.6)",
                                width: "48px",
                                height: "48px",
                                border: "1px solid rgba(254,139,58,255)"
                              }}
                            >
                              <input
                                hidden
                                type="file"
                                id="file"
                                accept="image/*"
                                onChange={(e) => setImg(e.target.files[0])}
                              />
                              <Collections />
                            </IconButton>
                            <Typography component="p" sx={{ fontSize: '15px', mt: 0.5 }}>Gallery</Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </SwipeableDrawer>
                  </Paper>

                  <SimpleSnack
                    message={SimpleSnacking.message}
                    open={SimpleSnacking.open}
                    setSimpleSnacking={setSimpleSnacking}
                    snackType={SimpleSnacking.snackType}
                  />
                </>
              )
          }
        </Drawer>
      </Paper>
    </>
  );
};

export default CurrentChat;
