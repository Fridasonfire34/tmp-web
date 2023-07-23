import { useState } from 'react';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Switch
} from '@mui/material';

type DialogDeleteSequenceProps = {
  open: boolean;
  id: string | null;
  isSaveBackup: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  onCheckSaveBackup: (saveBackup: boolean) => void;
};

const DialogDeleteSequence = ({
  open,
  id,
  isSaveBackup,
  onClose,
  onConfirm,
  onCheckSaveBackup
}: DialogDeleteSequenceProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveBackup, setSaveBackup] = useState(true);

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isSaveBackup}
                onChange={e => onCheckSaveBackup(e.target.checked)}
              />
            }
            label="Guardar respaldo"
          />
        </Box>
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
