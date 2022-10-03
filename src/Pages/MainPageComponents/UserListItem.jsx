import React, { useContext } from "react";

// Import Components
import {
    Box,
    Typography,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
} from "@mui/material";

// Import Icons
import { DoneAll, Photo } from "@mui/icons-material";

import { AuthContext } from "../../context/AuthContext";

const UserListItem = ({ chatDetails, handleOpenCurrentChat }) => {

    // Use AuthContext
    const { currentUser } = useContext(AuthContext);

    return (
        <ListItem
            alignItems="flex-start"
            sx={{
                paddingLeft: "0px",
            }}
            button
            onClick={() => handleOpenCurrentChat(chatDetails.userInfo.uid, chatDetails.userInfo)}
        >
            <ListItemAvatar>
                <Avatar alt={chatDetails.userInfo.displayName} src={chatDetails.userInfo.photoURL} />
            </ListItemAvatar>
            <ListItemText
                primary={chatDetails.userInfo.displayName}
                secondary={
                    <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center" }}
                    >
                        {
                            (chatDetails.lastMessage?.id == currentUser.uid) && (<DoneAll
                                sx={{ display: "inline", fontSize: "15px", mr: 0.9 }}
                            />)
                        }
                        <Typography
                            variant="span"
                            sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {
                                (chatDetails.lastMessage?.text == "") ?
                                    (
                                        <Typography
                                            variant="span"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Photo sx={{width: '18px', mr: 0.4}} />
                                            {"Photo"}
                                        </Typography>
                                    )
                                    :
                                    (chatDetails.lastMessage?.text)
                            }
                        </Typography>
                    </Box>
                }
            />
        </ListItem>
    )
}

export default UserListItem;