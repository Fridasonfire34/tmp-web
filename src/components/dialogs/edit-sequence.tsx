import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField
} from '@mui/material';

type Sequence = {
  id: string;
  partNumber: string;
  buildSequence: string;
  quantity: number;
  packingDiskNo: string;
  scannedBy: string;
};

type DialogEditSequenceProps = {
  open: boolean;
  sequence: Sequence | null;
  onClose: () => void;
  onConfirm: (sequence: Sequence) => void;
};

const DialogEditSequence = ({
  open,
  sequence,
  onClose,
  onConfirm
}: DialogEditSequenceProps) => {
  const [form, setForm] = useState<Sequence>({} as Sequence);

  useEffect(() => {
    setForm(sequence as Sequence);
  }, [sequence]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Mensaje</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Actualizar informacion de la pieza {sequence?.id}.
        </DialogContentText>
        {form && (
          <Box my={2}>
            {Object.keys(form).map(key => (
              <TextField
                key={key}
                fullWidth
                label={key}
                value={form[key as keyof Sequence]}
                disabled={key === 'id'}
                type={key === 'quantity' ? 'number' : 'text'}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                margin="normal"
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions onClick={onClose}>
        <Button>Cancelar</Button>
        <Button color="warning" onClick={() => onConfirm(form)}>
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogEditSequence;
