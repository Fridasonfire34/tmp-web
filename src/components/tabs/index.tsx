import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import SwipeableViews from 'react-swipeable-views';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  OutlinedInput,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import { formatDateWithTime } from '@/src/utils/data';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

type WeekTabsProps = {
  data: any[];
  onRefresh: () => void;
};

const WeekTabs = ({ data, onRefresh }: WeekTabsProps) => {
  const [value, setValue] = useState(0);
  const [openMenuTable, setOpenMenuTable] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userHasVerified, setUserHasVerified] = useState(false);
  const [week, setWeek] = useState(null);
  const [isDeleteSelected, setIsDeleteSelected] = useState(false);
  const [sequenceId, setSequenceId] = useState(null);

  const { data: client } = useSession();

  const router = useRouter();
  const theme = useTheme();

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'partNumber', headerName: 'Part Number', width: 200 },
    {
      field: 'buildSequence',
      headerName: 'Build Sequence',
      width: 150
    },
    {
      field: 'quantity',
      headerName: 'QTY',
      width: 50
    },
    {
      field: 'poNo',
      headerName: 'Po. No.'
    },
    {
      field: 'vendorNo',
      headerName: 'Vendor No.',
      width: 100
    },
    {
      field: 'packingDiskNo',
      headerName: 'Packing Disk No.',
      width: 150
    },
    {
      field: 'line',
      headerName: 'Line',
      width: 50
    },
    {
      field: 'scannedBy',
      headerName: 'Scanned By',
      width: 120
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 80,
      renderCell: cell => (
        <Stack direction="row" spacing={1}>
          <Button
            onClick={() => {
              setOpenDialog(true);
              setIsDeleteSelected(true);
              setSequenceId(cell.row.id);
            }}
          >
            <DeleteIcon
              sx={{
                '&:hover': {
                  color: 'red'
                }
              }}
            />
          </Button>
        </Stack>
      )
    }
  ];

  const handleDelete = () => {
    toast.loading('Eliminando registro...');
    axios({
      method: 'DELETE',
      url: `/api/sequences/remove?packingId=${sequenceId}`,
      headers: {
        id: client?.user.id as string
      }
    })
      .then(() => {
        toast.success('Registro eliminado correctamente.');
        onRefresh();
      })
      .catch(() => {
        toast.error('Ocurrió un error al eliminar el registro.');
      })
      .finally(() => {
        toast.dismiss();
        handleDialog();
        setSequenceId(null);
        setIsDeleteSelected(false);
        setPassword('');
      });
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  const handleMenuTable = () => {
    setOpenMenuTable(!openMenuTable);
  };

  const handleAdd = (week: string) => {
    router.push({
      pathname: '/sequences/add',
      query: { week }
    });
  };

  const handleDropWeek = () => {
    handleDialog();
    axios('/api/users/verify', {
      headers: {
        id: client?.user.id as string,
        password: password
      }
    })
      .then(() => {
        toast.success('Usuario verificado');
        setUserHasVerified(true);
      })
      .catch(() => {
        toast.error('Contraseña incorrecta');
        setUserHasVerified(false);
      })
      .finally(() => {
        setPassword('');
      });
  };

  const handleDialog = useCallback(() => {
    setOpenDialog(!openDialog);
  }, [openDialog]);

  useEffect(() => {
    if (userHasVerified) {
      toast.loading('Limpiando listado...');
      axios(`/api/sequences/truncate/week?week=${week}`, {
        method: 'DELETE',
        headers: {
          id: client?.user.id as string,
          password: password
        }
      })
        .then(() => {
          toast.success('Listado limpiado');
        })
        .catch(() => {
          toast.error('Ha ocurrido un error al limpiar el listado');
        })
        .finally(() => {
          setUserHasVerified(false);
          toast.dismiss();
          router.reload();
        });
    }
  }, [client?.user.id, password, router, userHasVerified, week]);

  return (
    <Box>
      <Card>
        <CardContent>
          {data?.length === 0 && (
            <Stack>
              <Typography color="gray" variant="subtitle1" gutterBottom>
                No existen secuencias registradas.
              </Typography>
            </Stack>
          )}
          {data.length > 0 && (
            <>
              <Tabs
                value={value}
                onChange={handleChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="week tabs"
              >
                {data?.map((week, index) => (
                  <Tab
                    key={index}
                    label={`${week.week}`}
                    {...a11yProps(week.id)}
                  />
                ))}
              </Tabs>
              <Divider />
              <SwipeableViews
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={value}
                onChangeIndex={handleChangeIndex}
              >
                {data?.map((week, index) => (
                  <TabPanel
                    key={index}
                    value={value}
                    index={index}
                    dir={theme.direction}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        Total de registros: <b>{week?.stack?.length}</b> en la
                        semana <b>{week.week}</b>
                      </Typography>
                      <Typography align="right" variant="body1" gutterBottom>
                        Fecha de registro:{' '}
                        <b>{formatDateWithTime(week.updateAt)}</b>
                      </Typography>
                    </Stack>
                    <List
                      aria-labelledby="nested-list-subheader"
                      sx={{
                        mb: 2,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: 2
                      }}
                    >
                      <ListItemButton onClick={handleMenuTable}>
                        <ListItemIcon>
                          <TuneIcon />
                        </ListItemIcon>
                        <ListItemText primary="Opciones de secuencias" />
                        {openMenuTable ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </ListItemButton>
                      <Collapse in={openMenuTable} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          <ListItemButton
                            sx={{ pl: 4 }}
                            onClick={() => handleAdd(week.week)}
                          >
                            <ListItemIcon>
                              <AddIcon />
                            </ListItemIcon>
                            <ListItemText primary="Añadir nueva secuencia a la semana actual" />
                          </ListItemButton>
                          <ListItemButton
                            sx={{ pl: 4, color: 'red' }}
                            onClick={() => {
                              setWeek(week.week);
                              handleDialog();
                            }}
                          >
                            <ListItemIcon>
                              <DeleteIcon color="error" />
                            </ListItemIcon>
                            <ListItemText primary="Eliminar todas las secuencias de la semana actual" />
                          </ListItemButton>
                        </List>
                      </Collapse>
                    </List>
                    <DataGrid
                      autoHeight
                      rows={week?.stack ?? []}
                      columns={columns}
                      components={{
                        NoRowsOverlay: () => (
                          <Stack
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            No hay datos para mostrar
                          </Stack>
                        ),
                        NoResultsOverlay: () => (
                          <Stack
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            No hay resultados para mostrar
                          </Stack>
                        )
                      }}
                    />
                  </TabPanel>
                ))}
              </SwipeableViews>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={openDialog} onClose={handleDialog}>
        <DialogTitle>Mensaje</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isDeleteSelected
              ? `Para elimimar la secuencia con el id: ${sequenceId}, por favor ingresa tu contraseña.`
              : ' Para poder eliminar el listado de secuencias, por favor ingresa tu contraseña.'}
          </DialogContentText>
          <FormControl fullWidth focused variant="outlined" sx={{ mt: 3 }}>
            <InputLabel htmlFor="outlined-adornment-password">
              Contraseña
            </InputLabel>
            <OutlinedInput
              autoFocus
              fullWidth
              margin="dense"
              label="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={e => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialog}>Cancelar</Button>
          <Button
            color="error"
            onClick={isDeleteSelected ? handleDelete : handleDropWeek}
            disabled={!password.length}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WeekTabs;
