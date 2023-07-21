import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import SwipeableViews from 'react-swipeable-views';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { format, set } from 'date-fns';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import DialogDeleteSequence from '../dialogs/delete-sequence';
import DialogEditSequence from '../dialogs/edit-sequence';

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

type Sequence = {
  id: string;
  partNumber: string;
  buildSequence: string;
  quantity: number;
  packingDiskNo: string;
  scannedBy: string;
};

const WeekTabs = ({ data, onRefresh }: WeekTabsProps) => {
  const [value, setValue] = useState(0);
  const [openMenuTable, setOpenMenuTable] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [userHasVerified, setUserHasVerified] = useState(false);
  const [sequenceId, setSequenceId] = useState(null);
  const [password, setPassword] = useState('');
  const [weekId, setWeekId] = useState(null);
  const [deleteType, setDeleteType] = useState<'sequence' | 'week' | 'edit'>(
    'sequence'
  );
  const [editSequence, setEditSequence] = useState<Sequence | null>(null);

  const { data: client } = useSession();

  const router = useRouter();
  const theme = useTheme();

  const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 50 },
    { field: 'partNumber', headerName: 'Part Number', width: 180 },
    {
      field: 'buildSequence',
      headerName: 'Build Sequence',
      width: 130
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
      width: 80
    },
    {
      field: 'scannedBy',
      headerName: 'Scanned By',
      width: 120
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: cell => (
        <Stack width="100%" direction="row">
          <IconButton
            color="primary"
            onClick={() => {
              setOpenDialog(true);
              setDeleteType('edit');
              setSequenceId(cell.row.id);
              setEditSequence({
                id: cell.row.id,
                partNumber: cell.row.partNumber,
                buildSequence: cell.row.buildSequence,
                quantity: cell.row.quantity,
                packingDiskNo: cell.row.packingDiskNo,
                scannedBy: cell.row.scannedBy
              });
            }}
          >
            <EditIcon
              sx={{
                '&:hover': {
                  color: 'orange'
                }
              }}
            />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => {
              setOpenDialog(true);
              setDeleteType('sequence');
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
          </IconButton>
        </Stack>
      )
    }
  ];

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

  const handleVerifyUser = (password: string) => {
    setPassword(password);
    setOpenDialog(false);
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
        setPassword('');
      });
  };

  const handleUpdateSequence = (sequence: Sequence) => {
    toast.loading('Actualizando registro...');
    setOpenDialogEdit(false);
    setEditSequence(null);
    axios({
      method: 'PUT',
      url: '/api/sequences/update',
      data: {
        ...sequence
      },
      headers: {
        id: client?.user.id as string
      }
    })
      .then(() => {
        toast.dismiss();
        toast.success('Registro actualizado correctamente.');
        onRefresh();
      })
      .catch(() => {
        toast.dismiss();
        toast.error('Ocurrió un error al actualizar el registro.');
      });
  };

  useEffect(() => {
    if (userHasVerified) {
      setOpenDialog(false);
      if (deleteType === 'sequence') {
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
            setSequenceId(null);
            setUserHasVerified(false);
          });
      } else if (deleteType === 'week') {
        toast.loading('Limpiando listado...');
        axios(`/api/sequences/truncate/week?week=${weekId}`, {
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
            setPassword('');
          });
      } else {
        setOpenDialogEdit(true);
        setPassword('');
        setUserHasVerified(false);
      }
    }
  }, [
    client?.user.id,
    deleteType,
    onRefresh,
    password,
    router,
    sequenceId,
    userHasVerified,
    weekId
  ]);

  return (
    <Box>
      <Card>
        <CardContent>
          {data?.length === 0 && (
            <Stack>
              <Typography color="gray" variant="subtitle1" gutterBottom>
                No existen semanas cargadas.
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
                {data?.map((week, index) => {
                  return (
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
                          <b>
                            {format(
                              new Date(week?.updateAt),
                              'dd/MM/yyyy HH:mm:ss'
                            )}
                          </b>
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
                          <ListItemText primary="Opciones" />
                          {openMenuTable ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </ListItemButton>
                        <Collapse
                          in={openMenuTable}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            <ListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => handleAdd(week.week)}
                            >
                              <ListItemIcon>
                                <AddIcon />
                              </ListItemIcon>
                              <ListItemText primary="Añadir nueva pieza a la semana actual" />
                            </ListItemButton>
                            <ListItemButton
                              sx={{ pl: 4, color: 'red' }}
                              onClick={() => {
                                setDeleteType('week');
                                setWeekId(week.week);
                                setOpenDialog(true);
                              }}
                            >
                              <ListItemIcon>
                                <DeleteIcon color="error" />
                              </ListItemIcon>
                              <ListItemText primary="Eliminar semana" />
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
                  );
                })}
              </SwipeableViews>
            </>
          )}
        </CardContent>
      </Card>
      <DialogDeleteSequence
        id={sequenceId || weekId}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleVerifyUser}
      />
      <DialogEditSequence
        open={openDialogEdit}
        sequence={editSequence}
        onClose={() => setOpenDialogEdit(false)}
        onConfirm={handleUpdateSequence}
      />
    </Box>
  );
};

export default WeekTabs;
