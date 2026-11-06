import type CrudGenerico from "../../appcore/ports/CrudGenerico";
import type UsuarioModel from "../../appcore/domain/usuario/UsuarioModel";
import conexao from "./knex/conexao";


export default class UsuarioCrud implements CrudGenerico<UsuarioModel> {
   
    private static tableUsuarios="usuarios";

    async adicionar(item: UsuarioModel): Promise<UsuarioModel> {

        await conexao(UsuarioCrud.tableUsuarios).insert(item);
        return item;   
    }
    
    async buscaPor(campo: string, valor: any): Promise<UsuarioModel | null> {

        const usuario = await conexao(UsuarioCrud.tableUsuarios)
            .where(campo, valor)
            .first<UsuarioModel>();
        return usuario ?? null;
    }
}
