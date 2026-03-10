import { randomUUID } from "node:crypto";
import type CrudGenerico from "../../ports/CrudGenerico";
import type ProvedorCriptografia from "../../ports/ProvedorCriptografia";
import UsuarioModel from "./UsuarioModel";
import UsuarioJaCadastradoError from "../errors/UsuarioJaCadastradoError";


export default class CriarUsuarioUsecase {

    constructor(
        private colecao: CrudGenerico<UsuarioModel>,
        private criptografia: ProvedorCriptografia
    ) {}

    async execute(nome: string, email: string, senha: string) {
        const senhaHash = this.criptografia.criptografar(senha);

        const usuarioExistente = await this.colecao.buscaPor("email", email);
        if (usuarioExistente) {
            throw new UsuarioJaCadastradoError();
        }

        const usuario = new UsuarioModel(
            randomUUID(),
            nome,
            email,
            senhaHash,
        );
        await this.colecao.adicionar(usuario);
        return usuario; 
    }
}