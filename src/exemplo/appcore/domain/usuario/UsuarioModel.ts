/** Entidade de usuário utilizada pelo núcleo da aplicação. */
export default class UsuarioModel {
    constructor(
        public readonly id: string,
        public readonly nome: string,
        public readonly email: string,
        public readonly senha: string
    ) {}
}
