import { useState } from 'react';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput
} from '@mui/material';

type DialogDeleteSequenceProps = {
  open: boolean;
  id: string | null;
  onClose: () => void;
  onConfirm: (password: string) => void;
};

const DialogDeleteSequence = ({
  open,
  id,
  onClose,
  onConfirm
}: DialogDeleteSequenceProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Mensaje</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Para poder eliminar la semana, por favor ingresa tu contraseña.
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
        <Button
          onClick={() => {
            onClose();
            setPassword('');
          }}
        >
          Cancelar
        </Button>
        <Button
          color="error"
          disabled={!password.length}
          onClick={() => {
            onConfirm(password);
            setPassword('');
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDeleteSequence;
