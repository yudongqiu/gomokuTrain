import PropTypes from 'prop-types';
// @mui
import { Card, CardHeader, CardContent, Box } from '@mui/material';
// components

// ----------------------------------------------------------------------

GameBoard.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};

// grid spacing
const GRID_SIZE = 40;
const PADDING = 40;

export default function GameBoard({ title, subheader, boardState, gameState, handlePlayStone }) {
  const intersections = [];
  for (let i = 0; i < 15; i += 1) {
    for (let j = 0; j < 15; j += 1) {
      intersections.push(Stone({
        row: i,
        col: j,
        value: boardState[i][j],
        onPlay: () => handlePlayStone(i,j),
        playing: gameState.playing,
      }));
    }    
  }
  const boardStyle = {
      width: 14 * GRID_SIZE + PADDING*2,
      height: 14 * GRID_SIZE + PADDING*2,
      position: "relative",
      backgroundColor: "#f1b06c",
      padding: PADDING,
      paddingTop: PADDING,
      margin: 'auto',
      boxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)",
  };
  const gridStyle = {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: `repeat(14, ${GRID_SIZE}px)`,
    gridTemplateRows: `repeat(14, ${GRID_SIZE}px)`,
    borderRight: "1px solid grey",
    borderBottom: "1px solid grey",
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    backgroundImage: "linear-gradient(to right, grey 1px, transparent 1px), linear-gradient(to bottom, grey 1px, transparent 1px)",
    zIndex: 1,
  };

  const stars = [[3,3], [3,11], [11,3], [11,11]].map(([r,l], idx) => {
    const starStyle = {
      width: "calc(100% / 8)",
      height: "calc(100% / 8)",
      borderRadius: "50%",
      backgroundColor: "grey",
      alignSelf: "center",
      justifySelf: "center",
      zIndex: 1,
      gridRowStart: r,
      gridRowEnd: r+2,
      gridColumnStart: l,
      gridColumnEnd: l+2,
    }
    return <div key={idx} style={starStyle} />;
  });
  return (
    <Card>
      <CardHeader title={title} subheader={subheader} />
      <CardContent sx={{ p: 3, minWidth: 700 }}>
        <div style={boardStyle} id="board">
          <div style={gridStyle}>{stars}</div>
          {intersections}
        </div>
      </CardContent>
    </Card>
  );
}


function Stone({ row, col, value, onPlay, playing }) {
  const sx = {
    top: PADDING - GRID_SIZE/2 + row * GRID_SIZE+2,
    left: PADDING - GRID_SIZE/2 + col * GRID_SIZE+2,
    width: GRID_SIZE - 4,
    height: GRID_SIZE - 4,
    borderRadius: "50%",
    position: "absolute",
    boxSizing: "border-box",
    zIndex: 2,
  };
  if (value === 1) {
    sx.backgroundColor = "#444";
    sx.boxShadow = "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)";
  } else if (value === 2) {
    sx.backgroundColor = "#eee";
    sx.boxShadow = "2px 2px 4px 0 rgba(0, 0, 0, 0.25), -2px -2px 4px 0 rgba(255, 255, 255, 0.25)";
  } else if (playing) {
    sx['&:hover'] = {
      backgroundColor: playing === 1 ? "rgba(100, 100, 100, 0.4)" : "rgba(250, 250, 250, 0.5)"
    };
  }
  return <Box key={row*15 + col} sx={sx} onClick={onPlay} />;
}