import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Card, CardHeader, CardContent,
  Button,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  List, ListItem, ListSubheader, ListItemIcon, ListItemText,
  Divider,
  FormControl, FormGroup, FormControlLabel, FormLabel, FormHelperText,
  Chip,
  Switch,
  Box,
  Stack,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import UndoIcon from '@mui/icons-material/Undo';
import CelebrationIcon from '@mui/icons-material/Celebration';
import HistoryIcon from '@mui/icons-material/History';
import ColorLensIcon from '@mui/icons-material/ColorLens';
// components
// ----------------------------------------------------------------------

GameControlPanel.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function GameControlPanel({ title, subheader, gameState, gameSettings, gameControls, handleUpdateSettings }) {
  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <GameInfo gameState={gameState}/>
        <Divider />
        <AppearanceSettings gameSettings={gameSettings} handleUpdateSettings={handleUpdateSettings}/>
        <Divider />
        <GameControls gameControls={gameControls}/>
        
      </CardContent>
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
  const status = gameState.winner > 0 ? <div>is winner <CelebrationIcon color="success"/></div>: <div>playing</div>;
  return (
    <Box sx={{display: 'flex', pb: 2 }}><div style={style} /> {status}</Box>
  );
}

export function AppearanceSettings({ gameSettings, handleUpdateSettings }) {
  const handleToggleSetting = (fieldName) => {
    const currentValue = gameSettings[fieldName];
    handleUpdateSettings(fieldName, !currentValue);
  };
  return (
    <List
      sx={{ width: '100%', maxWidth: 360 }}
      subheader={<ListSubheader sx={{pl: 0}}>Appearance</ListSubheader>}
      dense
    >
      <ListItem disableGutters>
        <ListItemIcon sx={{ minWidth:30 }}>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText primary="Show History" />
        <Switch
          edge="end"
          onChange={() => handleToggleSetting("showHistoryIdx")}
          checked={gameSettings.showHistoryIdx}
        />
      </ListItem>
      <ListItem disableGutters>
        <ListItemIcon sx={{ minWidth:30 }}>
          <ColorLensIcon />
        </ListItemIcon>
        <ListItemText primary="Board Color" />
        <ToggleButtonGroup
          exclusive
          onChange={(_, value) => handleUpdateSettings("boardColor", value)}
        >
          <ToggleButton value="pink" sx={{backgroundColor:"pink", minWidth:30}} />
          <ToggleButton value="#f1b06c" sx={{backgroundColor:"#f1b06c", minWidth:30}} />
        </ToggleButtonGroup>
      </ListItem>
    </List>
  );
}

export function GameControls({ gameControls }) {
  const [dialogOpen, setDialogOpen ] = useState(false);
    

  const handleOpenDialog = () => {
    setDialogOpen(true);
  }

  const handleCloseDialog = () => {
    setDialogOpen(false);
  }

  const handleUndoLastMove = () => {
    gameControls.undoLastMove();
  }

  return(
    <Box sx={{pt: 2}}>
      <Stack spacing={2} direction="row">
        <Button onClick={handleOpenDialog} variant="outlined" size="small" endIcon={<RefreshIcon />}>
          Restart
        </Button>
        <Button onClick={handleUndoLastMove} variant="outlined" size="small" endIcon={<UndoIcon />}>
          Undo
        </Button>
      </Stack>
      
      <ResetDialog open={dialogOpen} handleClose={handleCloseDialog} onConfirm={() => {handleCloseDialog(); gameControls.resetGame();}}/>
    </Box>
  )
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