import type UsuarioRepository from "../../ports/UsuarioRepository";
import type UsuarioModel from "./UsuarioModel";


export default class BuscaPorEmailUsuarioUsecase {

    constructor(
        private colecao: UsuarioRepository,
    ) {}

    async execute(email: string) {
        const usuario = await this.colecao.buscarPorEmail(email.trim().toLowerCase());
        return usuario || null; 
    }
}