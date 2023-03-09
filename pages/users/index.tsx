import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { User } from '@prisma/client';
import axios from 'axios';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { encrypt } from '@/lib/crypto';
import Layout from '@/src/components/layout';
import { isValidEmail } from '@/src/utils/masks';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [employeeType, setEmployeeType] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const { data: client } = useSession();

  const { isLoading, error, data, refetch } = useQuery(
    'users',
    () =>
      fetch('/api/users/list', {
        method: 'GET',
        headers: {
          id: client?.user.id as string
        }
      }).then(res => res.json()),
    {
      enabled: !!client?.user.id
    }
  );

  const columns: GridColDef[] = [
    {
      field: 'employeeId',
      headerName: 'No. de Empleado',
      width: 200
    },
    {
      field: 'name',
      headerName: 'Nombre',
      width: 200
    },
    {
      field: 'email',
      headerName: 'Correo electrónico',
      width: 200
    },
    {
      field: 'role',
      headerName: 'Tipo de empleado',
      width: 200,
      valueGetter: params => {
        const { role } = params.row as User;
        return role === 'admin' ? 'Administrador' : 'Empleado';
      }
    },
    {
      field: 'Actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton
          color="secondary"
          size="large"
          onClick={() => handleEditUser(params.row as User)}
        >
          <EditIcon />
        </IconButton>
      )
    }
  ];

  const handleEditUser = (user: User) => {
    setIsEdit(true);
    setForm({
      employeeId: user.employeeId as string,
      name: user.name as string,
      email: user.email as string,
      password: '',
      repeatPassword: ''
    });
    setEmployeeType(user.role as string);
    setOpenDialog(true);
  };

  const handleChangeEmployeeType = (event: SelectChangeEvent) => {
    setEmployeeType(event.target.value as string);
  };

  const handleClickShowPassword = () => {
    setShowPassword(show => !show);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleClickShowRepeatPassword = () => {
    setShowRepeatPassword(show => !show);
  };

  const handleMouseDownRepeatPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleResetForm = () => {
    setIsEdit(false);
    setEmployeeType('');
    setForm({
      employeeId: '',
      name: '',
      email: '',
      password: '',
      repeatPassword: ''
    });
  };

  const handleDialog = () => {
    handleResetForm();
    setOpenDialog(!openDialog);
  };

  const handleUpdateEmployee = () => {
    const data = {
      employeeId: form.employeeId,
      name: form.name,
      email: form.email,
      employeeType: employeeType
    };
    setLoading(true);
    axios('/api/users/update', {
      method: 'PUT',
      headers: {
        id: client?.user.id as string
      },
      data
    })
      .then(() => {
        toast.success('Usuario actualizado');
        refetch();
      })
      .catch(() => {
        toast.error('Error al actualizar el usuario');
        handleResetForm();
      })
      .finally(() => {
        handleResetForm();
        setLoading(false);
      });
  };

  const handleAddEmployee = () => {
    const data = {
      employeeId: form.employeeId,
      name: form.name,
      email: form.email,
      password: encrypt(form.password),
      employeeType: employeeType
    };
    setLoading(true);
    axios('/api/users/add', {
      method: 'POST',
      headers: {
        id: client?.user.id as string
      },
      data
    })
      .then(() => {
        toast.success('Usuario registrado');
        refetch();
      })
      .catch(() => {
        toast.error('Error al registrar el usuario');
        handleResetForm();
      })
      .finally(() => {
        handleResetForm();
        setLoading(false);
      });
  };

  const onSubmit = () => {
    setOpenDialog(false);
    if (isEdit) {
      handleUpdateEmployee();
    } else {
      handleAddEmployee();
    }
  };

  const isValidForm = useMemo(() => {
    if (isEdit) {
      return (
        employeeType.length > 0 &&
        form.email.length > 0 &&
        form.employeeId.length > 0 &&
        form.name.length > 0
      );
    }
    return (
      form.employeeId.length >= 4 &&
      form.name &&
      isValidEmail(form.email) &&
      form.password.length >= 6 &&
      form.repeatPassword === form.password &&
      employeeType.length
    );
  }, [
    employeeType.length,
    form.email,
    form.employeeId.length,
    form.name,
    form.password,
    form.repeatPassword,
    isEdit
  ]);

  useEffect(() => {
    if (data?.stack?.length > 0) {
      const removeCurrentClient = data.stack.filter(
        (user: User) => user.id !== client?.user.id
      );
      setRows(removeCurrentClient);
    }
  }, [client?.user.email, client?.user.id, data?.stack]);

  return (
    <Layout>
      <Head>
        <title>Usuarios</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Typography variant="h4" gutterBottom>
        Usuarios
      </Typography>
      <Typography variant="body1" gutterBottom>
        Aquí puedes ver todos los usuarios registrados en el sistema.
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        my={3}
      >
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="400"
          textAlign="center"
        >
          Total de usuarios registrados: {Number(data?.stack?.length) - 1 || 0}
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleDialog}>
          Agregar usuario
        </Button>
      </Stack>
      {isLoading && (
        <Stack gap={2}>
          <Typography variant="h5" gutterBottom>
            Cargando datos...
          </Typography>
          <CircularProgress color="secondary" />
        </Stack>
      )}
      {!isLoading && Boolean(error) && (
        <Stack>
          <Typography>
            Ha ocurrido un error al cargar los datos, por favor intenta de
            nuevo.
          </Typography>
        </Stack>
      )}
      {!isLoading && (
        <DataGrid
          autoHeight
          rows={rows ?? []}
          columns={columns}
          components={{
            NoRowsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No hay usuarios registrados
              </Stack>
            ),
            NoResultsOverlay: () => (
              <Stack height="100%" alignItems="center" justifyContent="center">
                No hay resultados
              </Stack>
            )
          }}
        />
      )}
      <Dialog open={openDialog} onClose={handleDialog}>
        <DialogTitle>Agregar usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para agregar un nuevo empleado, es necesario llenar el formulario y
            proporcionar su acceso.
          </DialogContentText>
          <Stack mt={2} gap={2}>
            <TextField
              fullWidth
              required
              disabled={isEdit}
              label="Número de empleado"
              type="number"
              value={form.employeeId}
              onChange={e => setForm({ ...form, employeeId: e.target.value })}
              error={!form.employeeId.length}
              helperText={
                form.employeeId.length ? '' : 'Número de empleado inválido'
              }
            />
            <TextField
              fullWidth
              required
              type="text"
              label="Nombre de empleado"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              error={!form.name.length}
              helperText={form.name.length ? '' : 'Nombre de empleado inválido'}
            />
            <TextField
              fullWidth
              required
              autoComplete="off"
              type="email"
              label="Correo electrónico de empleado"
              disabled={isEdit}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              error={!form.email.length}
              helperText={
                form.email.length
                  ? ''
                  : 'Correo electrónico de empleado inválido'
              }
            />
            {!isEdit && (
              <>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={!form.password.length}
                >
                  <InputLabel htmlFor="outlined-adornment-password">
                    Contraseña
                  </InputLabel>
                  <OutlinedInput
                    required
                    label="Contraseña"
                    id="outlined-adornment-password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e =>
                      setForm({ ...form, password: e.target.value })
                    }
                    error={!form.password.length}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error={!form.password.length}>
                    {form.password.length
                      ? ''
                      : 'La contraseña debe tener al menos 6 caracteres'}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  fullWidth
                  variant="outlined"
                  error={
                    !form.repeatPassword.length ||
                    form.repeatPassword !== form.password
                  }
                >
                  <InputLabel htmlFor="outlined-adornment-repeat-password">
                    Repetir contraseña
                  </InputLabel>
                  <OutlinedInput
                    required
                    label="Repetir contraseña"
                    id="outlined-adornment-repeat-password"
                    autoComplete="new-password"
                    value={form.repeatPassword}
                    onChange={e =>
                      setForm({ ...form, repeatPassword: e.target.value })
                    }
                    error={!form.repeatPassword.length}
                    type={showRepeatPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle repeat password visibility"
                          onClick={handleClickShowRepeatPassword}
                          onMouseDown={handleMouseDownRepeatPassword}
                          edge="end"
                        >
                          {showRepeatPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error={!form.repeatPassword.length}>
                    {form.repeatPassword.length
                      ? ''
                      : 'Las contraseñas no coinciden'}
                  </FormHelperText>
                </FormControl>
              </>
            )}
            <FormControl fullWidth error={!employeeType.length}>
              <InputLabel id="employee-simple-select-label">
                Seleccione un rol de empleado
              </InputLabel>
              <Select
                labelId="employee-simple-select-label"
                id="employee-simple-select"
                value={employeeType}
                label="Seleccione un rol de empleado"
                onChange={handleChangeEmployeeType}
              >
                <MenuItem value="user">Empleado</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleDialog}>
            Cancelar
          </Button>
          <LoadingButton
            loading={loading}
            disabled={!isValidForm}
            onClick={onSubmit}
          >
            {isEdit ? 'Actualizar empleado' : 'Agregar empleado'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
