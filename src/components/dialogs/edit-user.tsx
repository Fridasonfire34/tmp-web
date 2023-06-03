import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField
} from '@mui/material';
import { User } from '@prisma/client';

type DialogEditUserProps = {
  open: boolean;
  isLoading: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (form: User) => void;
};

const DialogEditUser = ({
  open,
  isLoading,
  user,
  onClose,
  onSubmit
}: DialogEditUserProps) => {
  const [form, setForm] = useState<User>({} as User);

  useEffect(() => {
    if (user) {
      setForm(user);
    }
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Editar usuario</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Este es un diálogo de edición de usuario
        </DialogContentText>
        <Stack mt={2} gap={2}>
          <TextField
            fullWidth
            disabled
            placeholder="ID"
            label="ID"
            value={form.id}
          />
          <TextField
            placeholder="No. de Empleado"
            disabled
            label="No. de Empleado"
            value={form.employeeId}
            onChange={e => setForm({ ...form, employeeId: e.target.value })}
          />
          <TextField
            placeholder="Nombre"
            label="Nombre"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          loading={isLoading}
          onClick={() => {
            onSubmit(form);
            setForm({} as User);
          }}
        >
          Actualizar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogEditUser;
