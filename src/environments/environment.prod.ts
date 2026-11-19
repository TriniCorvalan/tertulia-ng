/** Build Docker/nginx: rutas relativas proxyadas a los microservicios. */
export const environment = {
  production: true,
  authApiUrl: '',
  /** Prefijo para no chocar con rutas Angular /categorias y /temas. */
  foroApiUrl: '/api',
  moderacionApiUrl: '',
};
