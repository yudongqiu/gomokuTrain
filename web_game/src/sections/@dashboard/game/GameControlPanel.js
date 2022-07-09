import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Card, CardHeader, CardContent,
  Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  List, ListItem,
  Divider,
  FormControl, FormGroup, FormControlLabel, FormLabel, FormHelperText,
  Chip,
  Switch,
  Box,
} from '@mui/material';
// components
import Iconify from '../../../components/Iconify';
// ----------------------------------------------------------------------

GameControlPanel.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function GameControlPanel({ title, subheader, gameState, resetGame, handleUpdateSettings }) {
  
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
        <Divider />
        <AppearanceSettings gameState={gameState} handleUpdateSettings={handleUpdateSettings}/>
        <Divider />
        <Box sx={{pt: 2}}>
          <Button onClick={handleOpenDialog} variant="outlined" endIcon={<Iconify icon="ic:baseline-restart-alt" width={20} height={20} />}>
            Restart
          </Button>
        </Box>
      </CardContent>
      <ResetDialog open={dialogOpen} handleClose={handleCloseDialog} onConfirm={() => {handleCloseDialog(); resetGame();}}/>
    </Card>
  );
}

export function GameInfo({ gameState }) {
  const player = gameState.winner || gameState.playing;
  const style = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    borderWidth: 1,
    boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)",
    backgroundColor: player === 1 ? "#444" : "#eee",
    marginRight: 15,
  };
  const status = gameState.winner > 0 ? <div>is winner <Iconify icon="emojione:party-popper" width={30} height={20} /></div>: <div>playing</div>;
  return (
    <Box sx={{display: 'flex', pb: 2 }}><div style={style} /> {status}</Box>
  );
}

export function AppearanceSettings({ gameState, handleUpdateSettings }) {
  const settings = gameState.settings || {};
  const handleToggleSetting = (fieldName) => {
    const currentValue = settings[fieldName];
    handleUpdateSettings(fieldName, !currentValue);
  };
  return (
    <Box sx={{pt: 2, pb: 2}}>
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend">Appearance</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={settings.showHistoryIdx} onChange={() => handleToggleSetting("showHistoryIdx")} />
            }
            label="Show History"
          />
        </FormGroup>
      </FormControl>
    </Box>
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