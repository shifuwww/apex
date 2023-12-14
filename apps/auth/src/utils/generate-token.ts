import { RANDOM_TOKEN_LENGTH } from '../consts';

export const generateToken = () => {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < RANDOM_TOKEN_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    token += alphabet[randomIndex];
  }
  return token;
};
