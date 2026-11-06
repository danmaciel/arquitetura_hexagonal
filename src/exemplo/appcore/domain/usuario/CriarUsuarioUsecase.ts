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
        if (!nome.trim()) {
            throw new Error("O nome do usuário é obrigatório.");
        }
        const emailNormalizado = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
            throw new Error("Informe um e-mail válido.");
        }
        if (!senha.trim()) {
            throw new Error("A senha não pode estar vazia.");
        }

        const usuarioExistente = await this.colecao.buscarPorEmail(emailNormalizado);
        if (usuarioExistente) {
            throw new UsuarioJaCadastradoError();
        }

        const senhaHash = this.criptografia.criptografar(senha);

        const usuario = new UsuarioModel(
            randomUUID(),
            nome,
            emailNormalizado,
            senhaHash,
        );
        await this.colecao.adicionar(usuario);
        return usuario; 
    }
}