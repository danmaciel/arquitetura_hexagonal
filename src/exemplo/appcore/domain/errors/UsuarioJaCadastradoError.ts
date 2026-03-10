export default class UsuarioJaCadastradoError extends Error {
  constructor() {
    super("Usuário com este email já existe");
    this.name = 'UsuarioJaCadastradoError';
    
    // Corrige a cadeia de protótipos para instanceof funcionar corretamente
    Object.setPrototypeOf(this, UsuarioJaCadastradoError.prototype);
  }
}