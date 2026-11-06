import type UsuarioRepository from "../../appcore/ports/UsuarioRepository";
import type UsuarioModel from "../../appcore/domain/usuario/UsuarioModel";
import conexao from "./knex/conexao";
import UsuarioJaCadastradoError from "../../appcore/domain/errors/UsuarioJaCadastradoError";


export default class UsuarioCrud implements UsuarioRepository {
   
    private static tableUsuarios="usuarios";

    async adicionar(item: UsuarioModel): Promise<UsuarioModel> {

        try {
            await conexao(UsuarioCrud.tableUsuarios).insert(item);
        } catch (error) {
            // A consulta prévia do caso de uso não elimina disputas entre cadastros.
            // A restrição UNIQUE do banco é a garantia final de unicidade.
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                "message" in error &&
                typeof error.code === "string" &&
                error.code.startsWith("SQLITE_CONSTRAINT") &&
                typeof error.message === "string" &&
                error.message.includes("UNIQUE constraint failed: usuarios.email")
            ) {
                throw new UsuarioJaCadastradoError();
            }
            throw error;
        }
        return item;   
    }
    
    async buscarPorEmail(email: string): Promise<UsuarioModel | null> {

        const usuario = await conexao(UsuarioCrud.tableUsuarios)
            .where("email", email)
            .first<UsuarioModel>();
        return usuario ?? null;
    }
}
