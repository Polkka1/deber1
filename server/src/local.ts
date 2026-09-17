// Servidor para desarrollo local (npm run dev). En Vercel no se usa.
import app from './index.js';

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
