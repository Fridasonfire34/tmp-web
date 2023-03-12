import * as bcryptjs from 'bcryptjs';

const saltRounds = 10;
const passwordDefault = 'TMP_202*!?';

const encrypt = (text: string) => {
  return bcryptjs.hashSync(text, saltRounds);
};

const decrypt = (local: string, remote: string) => {
  return bcryptjs.compareSync(local, remote);
};

export { decrypt, encrypt };
