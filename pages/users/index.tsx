import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQuery } from 'react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { User } from '@prisma/client';
import axios from 'axios';
import Head from 'next/head';
import { useSession } from 'next-auth/react';

import { encrypt } from '@/lib/crypto';
import DialogAddUser, { UserForm } from '@/src/components/dialogs/add-user';
import DialogEditUser from '@/src/components/dialogs/edit-user';
import Layout from '@/src/components/layout';

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [openDialogAddUser, setOpenDialogAddUser] = useState(false);
  const [loadingAddUser, setLoadingAddUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userEdit, setUserEdit] = useState<User | null>(null);
  const [openDialogEditUser, setOpenDialogEditUser] = useState(false);
  const [loadingEditUser, setLoadingEditUser] = useState(false);

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
        <Stack direction="row" justifyContent="center" alignItems="center">
          <IconButton
            color="secondary"
            size="large"
            onClick={() => {
              if (currentUser?.role?.toLowerCase() === 'admin') {
                setUserEdit(params.row as User);
                setOpenDialogEditUser(true);
              } else {
                toast.error('No tienes permisos para editar este usuario');
              }
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              if (currentUser?.role?.toLowerCase() === 'admin') {
                handleConfirmDeleteUser(params.row.id as string);
              } else {
                toast.error('No tienes permisos para eliminar este usuario');
              }
            }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        </Stack>
      )
    }
  ];

  const handleAddUser = (form: UserForm) => {
    setLoadingAddUser(true);
    const data = {
      employeeId: form.employeeId,
      name: form.name,
      password: encrypt(form.password),
      employeeType: form.employeeType
    };
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
      })
      .finally(() => {
        setLoadingAddUser(false);
        setOpenDialogAddUser(false);
      });
  };

  const handleUpdateUser = (form: User) => {
    setLoadingEditUser(true);
    const data = {
      employeeId: form.employeeId,
      name: form.name
    };
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
      })
      .finally(() => {
        setLoadingEditUser(false);
        setOpenDialogEditUser(false);
      });
  };

  const handleConfirmDeleteUser = (id: string) => {
    toast(
      <Box>
        <Typography variant="body1" gutterBottom>
          ¿Estás seguro de eliminar este usuario?
        </Typography>
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Button fullWidth onClick={() => toast.dismiss()}>
            Cancelar
          </Button>
          <Button
            fullWidth
            color="warning"
            onClick={() => handleDeleteUser(id)}
          >
            Eliminar
          </Button>
        </Stack>
      </Box>
    );
  };

  const handleDeleteUser = (id: string) => {
    toast.dismiss();
    toast.loading('Eliminando usuario');
    axios('/api/users/delete', {
      method: 'DELETE',
      headers: {
        id: client?.user.id as string
      },
      data: {
        employeeId: id
      }
    })
      .then(() => {
        toast.dismiss();
        toast.success('Usuario eliminado');
        refetch();
      })
      .catch(() => {
        toast.dismiss();
        toast.error('Error al eliminar el usuario');
      });
  };

  useEffect(() => {
    if (data?.stack?.length > 0) {
      const removeCurrentClient = data.stack.filter(
        (user: User) => user.id !== client?.user.id
      );
      setRows(removeCurrentClient);
      setCurrentUser(
        data.stack.find((user: User) => user.id === client?.user.id)
      );
    }
  }, [client?.user.id, data?.stack]);

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
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (currentUser?.role?.toLocaleLowerCase() === 'admin') {
              setOpenDialogAddUser(true);
            } else {
              toast.error('No tienes permisos para realizar esta acción');
            }
          }}
        >
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
      <DialogAddUser
        open={openDialogAddUser}
        isLoading={loadingAddUser}
        onClose={() => setOpenDialogAddUser(false)}
        onSubmit={handleAddUser}
      />
      <DialogEditUser
        open={openDialogEditUser}
        user={userEdit}
        isLoading={loadingEditUser}
        onClose={() => setOpenDialogEditUser(false)}
        onSubmit={handleUpdateUser}
      />
    </Layout>
  );
}
