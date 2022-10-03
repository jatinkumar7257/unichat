import React from 'react';
import { Snackbar, Alert, SnackbarContent } from '@mui/material';

const SimpleSnack = (props) => {

    const handleCloseSimpleSnack = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        props.setSimpleSnacking({
            open: false,
            message: '',
            snackType: props.snackType
        });
    };

    return (
        <Snackbar
            open={props.open}
            autoHideDuration={6000}
            onClose={handleCloseSimpleSnack}
        >
            {
                (props.snackType === 'user added') ?
                    (
                        <Alert onClose={handleCloseSimpleSnack} sx={{ width: '100%', backgroundColor: "rgba(0, 0, 0, 0.895)", color: "#ffffff",
                        '& .MuiAlert-icon': {
                            display: 'none'
                        } }}>
                            {props.message}
                        </Alert>
                    ) 
                    :
                    (
                        <Alert onClose={handleCloseSimpleSnack} severity={props.snackType} sx={{ width: '100%'}}>
                            {props.message}
                        </Alert>
                    )
            }
        </Snackbar>
    );
}

export default SimpleSnack;