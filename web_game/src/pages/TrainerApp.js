import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppWidgetSummary,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

const COLUMNS = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'epoch', headerName: 'Epoch', width: 130 },
  { field: 'count', headerName: 'Data count', width: 230 },
  { field: 'loss', headerName: 'Training Loss', width: 130 },
  { field: 'valLoss', headerName: 'Validation Loss', width: 130 },
  { field: 'time', headerName: 'Epoch Time', width: 130 },
]

export default function TrainerApp({ aiServer, serverState }) {
  const theme = useTheme();

  const [machineStat, setMachineStat] = useState({});
  const [trainProcess, setTrainProcess] = useState({models: []});

  useEffect(() => {
    const interval = setInterval(() => {
      if (aiServer) {
        aiServer.socket.emit("getMachineStats", (data) => {
          setMachineStat(data)
        });
      }
    }, 2000);
    return () => clearInterval(interval);    
  }, [setMachineStat]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (aiServer) {
        aiServer.socket.emit("getTrainProcess", (data) => {
          setTrainProcess(data)
        });
      }
    }, 5000);
    return () => clearInterval(interval);    
  }, [setTrainProcess]);

  return (
    <Page title="Trainer">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="CPU Usage" percent={machineStat.cpu_usage} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Memory" percent={machineStat.memory_usage} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="GPU Usage" percent={machineStat.gpu_usage} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="GPU Memory" percent={machineStat.gpu_memory_usage} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

          <Grid item xs={12} md={12} lg={12}>
            <div style={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={trainProcess.models}
                getRowId={(row) => row.name || '1'}
                columns={COLUMNS}
                rowsPerPageOptions={[10, 25, 100]}
              />
            </div>
          </Grid>
        </Grid>  
      </Container>
    </Page>
  );
}
