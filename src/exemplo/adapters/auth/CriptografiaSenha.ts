import type ProvedorCriptografia from "../../appcore/ports/ProvedorCriptografia";


export default class CriptografiaSenha implements ProvedorCriptografia {
    criptografar(senha: string): string {
        return senha.split('').reverse().join("");
    }

    comparar(senha: string, senhaCriptografada: string): boolean{
        return this.criptografar(senha) === senhaCriptografada;
    }
}