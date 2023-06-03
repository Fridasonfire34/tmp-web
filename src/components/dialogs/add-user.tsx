import { useMemo, useState } from 'react';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Button,
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
  TextField
} from '@mui/material';

export type UserForm = {
  employeeId: string;
  name: string;
  password: string;
  repeatPassword: string;
  employeeType: string;
};

type DialogAddUserProps = {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (form: UserForm) => void;
};

const DialogAddUser = ({
  open,
  isLoading,
  onClose,
  onSubmit
}: DialogAddUserProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [employeeType, setEmployeeType] = useState('');
  const [form, setForm] = useState<UserForm>({
    employeeId: '',
    name: '',
    password: '',
    repeatPassword: ''
  } as UserForm);

  const handleChangeEmployeeType = (event: SelectChangeEvent) => {
    setEmployeeType(event.target.value as string);
  };

  const handleClickShowRepeatPassword = () => {
    setShowRepeatPassword(show => !show);
  };

  const handleMouseDownRepeatPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleClickShowPassword = () => {
    setShowPassword(show => !show);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const isValidForm = useMemo(() => {
    return (
      form.employeeId.length >= 4 &&
      form.name &&
      form.password.length >= 6 &&
      form.repeatPassword === form.password &&
      employeeType.length
    );
  }, [
    employeeType.length,
    form.employeeId.length,
    form.name,
    form.password,
    form.repeatPassword
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
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
              onChange={e => setForm({ ...form, password: e.target.value })}
              error={!form.password.length || form.password.length < 6}
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText error={!form.password.length}>
              {form.password.length >= 6
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
              {form.repeatPassword.length ? '' : 'Las contraseñas no coinciden'}
            </FormHelperText>
          </FormControl>
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
        <Button color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          loading={isLoading}
          disabled={!isValidForm}
          onClick={() => {
            onSubmit({
              ...form,
              employeeType
            });
            setForm({
              employeeId: '',
              name: '',
              password: '',
              repeatPassword: ''
            } as UserForm);
            setEmployeeType('');
          }}
        >
          Agregar usuario
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddUser;
