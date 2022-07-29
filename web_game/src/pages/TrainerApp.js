import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Grid,
  Container,
  Typography,
  Card,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
// components
import Page from '../components/Page';
// sections
import {
  AppWidgetSummary,
  AppWebsiteVisits,
} from '../sections/@dashboard/app';

// ----------------------------------------------------------------------

const COLUMNS = [
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'epoch', headerName: 'Epoch', width: 130 },
  { field: 'count', headerName: 'Data count', width: 150 },
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

  // console.log(trainProcess.models.map(data => parseInt(data.epoch, 10)));

  return (
    <Page title="Trainer">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={6} md={3}>
            <AppWidgetSummary title="CPU Usage" percent={machineStat.cpu_usage|| 0} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <AppWidgetSummary title="Memory" percent={machineStat.memory_usage|| 0} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <AppWidgetSummary title="GPU Usage" percent={machineStat.gpu_usage|| 0} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={6} sm={6} md={3}>
            <AppWidgetSummary title="GPU Memory" percent={machineStat.gpu_memory_usage || 0} color="error" icon={'ant-design:bug-filled'} />
          </Grid>
          {trainProcess.models && trainProcess.models.length > 0 &&
            <Grid item xs={12} md={12} lg={12}>
              <AppWebsiteVisits
                title="Training Progress"
                subheader="MSELoss decrease"
                chartLabels={trainProcess.models.map(data => data.name)}
                chartData={[
                  {
                    name: 'Epoch',
                    type: 'column',
                    fill: 'solid',
                    data: trainProcess.models.map(data => parseInt(data.epoch, 10)),
                  },
                  {
                    name: 'Training Loss',
                    type: 'area',
                    fill: 'gradient',
                    data: trainProcess.models.map(data => parseFloat(data.loss)),
                  },
                  {
                    name: 'Validation Loss',
                    type: 'line',
                    fill: 'solid',
                    data: trainProcess.models.map(data => parseFloat(data.valLoss)),
                  },
                ]}
              />
            </Grid>
          }
          <Grid item xs={12} md={12} lg={12}>
            <Card style={{height: 600, width: '100%' }}>
              <DataGrid
                rows={trainProcess.models}
                getRowId={(row) => row.name || '1'}
                columns={COLUMNS}
                rowsPerPageOptions={[10, 25, 100]}
                sx={{p: 2}}
              />
            </Card>
          </Grid>
        </Grid>  
      </Container>
    </Page>
  );
}
