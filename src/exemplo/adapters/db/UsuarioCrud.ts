import type UsuarioRepository from "../../appcore/ports/UsuarioRepository";
import type UsuarioModel from "../../appcore/domain/usuario/UsuarioModel";
import conexao from "./knex/conexao";


export default class UsuarioCrud implements UsuarioRepository {
   
    private static tableUsuarios="usuarios";

    async adicionar(item: UsuarioModel): Promise<UsuarioModel> {

        await conexao(UsuarioCrud.tableUsuarios).insert(item);
        return item;   
    }
    
    async buscarPorEmail(email: string): Promise<UsuarioModel | null> {

        const usuario = await conexao(UsuarioCrud.tableUsuarios)
            .where("email", email)
            .first<UsuarioModel>();
        return usuario ?? null;
    }
}
