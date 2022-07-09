import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Card, CardHeader, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, List, ListItem } from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
// ----------------------------------------------------------------------

GameControlPanel.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function GameControlPanel({ title, subheader, boardState, gameState, resetGame }) {
  
  const [dialogOpen, setDialogOpen ] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
  }

  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <GameInfo gameState={gameState}/>
        <Button onClick={handleOpenDialog} variant="outlined" endIcon={<Iconify icon="ic:baseline-restart-alt" width={20} height={20} />}>
          Restart
        </Button>
      </CardContent>
      <ResetDialog open={dialogOpen} handleClose={handleCloseDialog} onConfirm={() => {handleCloseDialog(); resetGame();}}/>
    </Card>
  );
}

export function GameInfo({ gameState }) {
  
  return (
    <List>
      <ListItem>Playing: {gameState.playing}</ListItem>
    </List>
    
  );
}

export function ResetDialog({ open, handleClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Confirm Restart Game?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          The current progress will be lost
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={handleClose} autoFocus>Cancel</Button>
        <Button variant="contained" onClick={() => onConfirm()}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}