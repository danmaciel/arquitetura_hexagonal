import type CrudGenerico from "../../ports/CrudGenerico";
import type UsuarioModel from "./UsuarioModel";


export default class BuscaPorEmailUsuarioUsecase {

    constructor(
        private colecao: CrudGenerico<UsuarioModel>,
    ) {}

    async execute(email: string) {
        const usuario = await this.colecao.buscaPor("email", email);
        return usuario || null; 
    }
}