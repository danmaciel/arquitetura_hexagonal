import bcrypt from "bcrypt";
import type ProvedorCriptografia from "../../appcore/ports/ProvedorCriptografia";

export default class CriptografiaSenhaReal implements ProvedorCriptografia {
    criptografar(senha: string): string {
        const sault = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(senha, sault);
    }

    comparar(senha: string, senhaCriptografada: string): boolean{
        return bcrypt.compareSync(senha, senhaCriptografada);
    }
}