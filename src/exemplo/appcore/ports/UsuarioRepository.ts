import type UsuarioModel from "../domain/usuario/UsuarioModel";

/** Contrato orientado às necessidades dos casos de uso, sem detalhes de SQL. */
export default interface UsuarioRepository {
    adicionar(usuario: UsuarioModel): Promise<UsuarioModel>;
    buscarPorEmail(email: string): Promise<UsuarioModel | null>;
}
