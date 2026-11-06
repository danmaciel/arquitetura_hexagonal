import { randomUUID } from "node:crypto";
import type UsuarioRepository from "../../ports/UsuarioRepository";
import type ProvedorCriptografia from "../../ports/ProvedorCriptografia";
import UsuarioModel from "./UsuarioModel";
import UsuarioJaCadastradoError from "../errors/UsuarioJaCadastradoError";


export default class CriarUsuarioUsecase {

    constructor(
        private colecao: UsuarioRepository,
        private criptografia: ProvedorCriptografia
    ) {}

    async execute(nome: string, email: string, senha: string) {
        const usuarioExistente = await this.colecao.buscarPorEmail(email);
        if (usuarioExistente) {
            throw new UsuarioJaCadastradoError();
        }

        const senhaHash = this.criptografia.criptografar(senha);

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