import type CrudGenerico from "../../appcore/ports/CrudGenerico";
import type UsuarioModel from "../../appcore/domain/usuario/UsuarioModel";
import conexao from "./knex/conexao";


export default class UsuarioCrud implements CrudGenerico<UsuarioModel> {
   
    private static tableUsuarios="usuarios";

    async adicionar(item: UsuarioModel): Promise<UsuarioModel> {

        return conexao
                .insert(item)
                .into(UsuarioCrud.tableUsuarios);   
    }
    
    async buscaPor(campo: string, valor: any): Promise<UsuarioModel | null> {

        return conexao               
                .select("*")
                .from(UsuarioCrud.tableUsuarios)
                .where(campo, valor)
                .first();
    }
}
