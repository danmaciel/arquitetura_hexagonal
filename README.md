# 🏗️ Arquitetura - Exemplo de Arquitetura Hexagonal/Limpa

Um projeto exemplo que demonstra os princípios de **Arquitetura Limpa** (Clean Architecture) e **Arquitetura Hexagonal** (Ports & Adapters) implementados em TypeScript.

## 📋 Visão Geral

Este projeto ilustra como desacoplar a lógica de negócio das dependências externas (banco de dados, criptografia, etc.) através de interfaces (ports) e implementações concretas (adapters).

**Caso de uso**: cadastro e busca de usuários com armazenamento seguro da senha. Não há login, autenticação HTTP ou emissão de tokens neste exemplo.

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **TypeScript** | 5.9 | Linguagem tipada |
| **Node.js** | ESNext | Runtime JavaScript |
| **Jest** | 30.2 | Framework de testes |
| **Knex.js** | 3.1 | Query builder SQL |
| **SQLite (better-sqlite3)** | 12.6 | Banco de dados |
| **bcrypt** | 6.0 | Criptografia de senhas |

## 🏛️ Arquitetura

O projeto segue o padrão de **Arquitetura Hexagonal**, dividido em 3 camadas:

```
┌─────────────────────────────────────┐
│      Domain (Núcleo/Entidades)      │
│  - UsuarioModel                     │
│  - CriarUsuarioUsecase              │
│  - BuscaPorEmailUsuarioUsecase      │
│  - Errors                           │
└─────────────────────────────────────┘
          ↑                  ↑
          │ depende de       │ depende de
          │                  │
┌──────────────────────┐  ┌──────────────────────┐
│  Ports (Interfaces)  │  │  Adapters (Implem.)  │
│                      │  │                      │
│ - UsuarioRepository    │→→│ - UsuarioCrud        │
│ - ProvedorCriptogr.  │→→│ - CriptografiaSenha  │
│                      │  │ - CriptSenhaReal     │
└──────────────────────┘  └──────────────────────┘
                              ↓         ↓
                           Knex     bcrypt
                           SQLite3
```

### 📦 Estrutura de Pastas

```
src/
├── index.ts                          # Entry point
└── exemplo/
    ├── appcore/                      # Núcleo da aplicação
    │   ├── domain/
    │   │   ├── usuario/
    │   │   │   ├── UsuarioModel.ts           # Entidade de usuário
    │   │   │   ├── CriarUsuarioUsecase.ts    # Caso de uso: criar
    │   │   │   └── BuscaPorEmailUsuarioUsecase.ts  # Caso de uso: buscar
    │   │   └── errors/
    │   │       └── UsuarioJaCadastradoError.ts     # Erro customizado
    │   └── ports/                   # Contratos/Interfaces
    │       ├── UsuarioRepository.ts              # Porta tipada de usuários
    │       └── ProvedorCriptografia.ts      # Interface de criptografia
    │
    └── adapters/                     # Implementações concretas
        ├── auth/                     # Adaptadores de autenticação
        │   ├── CriptografiaSenha.ts         # Implementação "fake"
        │   └── CriptografiaSenhaReal.ts     # Implementação real (bcrypt)
        └── db/                       # Adaptadores de banco de dados
            ├── UsuarioCrud.ts               # CRUD de usuário via Knex
            └── knex/
                ├── conexao.ts               # Instância da conexão
                ├── knexfile.js              # Configuração do Knex
                ├── banco.sqlite3            # Banco local gerado (ignorado pelo Git)
                └── migrations/              # Scripts de migração

test/
├── CriarUsuarioUsecase.test.ts       # Testes: criação de usuário
└── BuscarPorEmailUsuarioUsecase.test.ts  # Testes: busca de usuário
```

## 🔑 Conceitos Principais

### **Domain (Domínio)**
Contém a lógica de negócio pura. Não tem dependências externas, apenas das interfaces (ports).

- **UsuarioModel**: Representa uma entidade de usuário
- **CriarUsuarioUsecase**: Encapsula a lógica de criar um novo usuário
  - Valida email duplicado
  - Criptografa a senha
  - Persiste no banco
- **BuscaPorEmailUsuarioUsecase**: Busca usuário por email

### **Ports (Interfaces)**
Define contratos que o domínio depende, sem conhecer a implementação.

```typescript
// Qualquer coisa que implemente isso pode ser usada
interface UsuarioRepository {
  adicionar(usuario: UsuarioModel): Promise<UsuarioModel>;
  buscarPorEmail(email: string): Promise<UsuarioModel | null>;
}

interface ProvedorCriptografia {
  criptografar(senha: string): string;
  comparar(senha: string, senhaCriptografada: string): boolean;
}
```

### **Adapters (Implementações)**
Conecta o domínio com o mundo externo (banco, criptografia, APIs, etc).

- **CriptografiaSenha**: Implementação simples (inverte a string) - útil para testes
- **CriptografiaSenhaReal**: Implementação real com bcrypt - para produção
- **UsuarioCrud**: Implementa operações de banco via Knex + SQLite

## Demonstração executável

Este repositório apresenta um **exemplo de linha de comando** e não uma API HTTP. O ponto de entrada `src/index.ts` é o *composition root*: instancia os adapters de persistência (Knex/SQLite) e criptografia (bcrypt), aplica as migrations e os conecta aos casos de uso.

```bash
npm ci
npm run demo
```

A demonstração cria um usuário fictício com e-mail aleatório, persiste a senha usando bcrypt, consulta o registro e imprime **somente ID, nome e e-mail**. Nenhuma senha ou hash é exibido. O banco SQLite é local e ignorado pelo Git.

Para escolher outro arquivo SQLite, configure `SQLITE_DB_PATH` com um caminho de arquivo em um diretório existente:

```bash
SQLITE_DB_PATH=/tmp/hexagonal-demo.sqlite3 npm run demo
```

Execute `npm test -- --runInBand --ci` para validar as regras do núcleo com mocks e a persistência com bancos descartáveis. A entidade mantém a senha como hash (campo obrigatório); a validação de nome, e-mail e senha de entrada é realizada no caso de uso de criação. Essas verificações são básicas e não substituem uma política completa de senhas nem uma camada de interface.

## 🚀 Como Usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Executa o projeto em modo watch com `ts-node-dev`.

### Build

```bash
npm run build
```

Compila TypeScript em JavaScript na pasta `dist/`.

### Testes

```bash
npm test
```

Executa os testes Jest. As suítes criam bancos SQLite temporários, aplicam as migrations e removem os arquivos após sua execução, sem modificar o banco de desenvolvimento.

#### Testes Inclusos

1. **CriarUsuarioUsecase.test.ts**
   - ✅ Criar usuário com sucesso
   - ✅ Validar duplicação de email
   - ✅ Criptografar senha corretamente
   - ✅ Comparar senhas

2. **BuscarPorEmailUsuarioUsecase.test.ts**
   - ✅ Buscar usuário existente
   - ✅ Retornar `null` se não encontrado

### Migrations do Banco

```bash
# Criar uma nova migração
npm run migration:make -- --name meu_schema

# Aplicar migrations pendentes
npm run migration:up

# Desfazer última migração
npm run migration:down
```

## 💡 Benefícios da Arquitetura

| Benefício | Descrição |
|-----------|-----------|
| **Testabilidade** | Lógica separada permite testes unitários fáceis |
| **Flexibilidade** | Trocar implementação (bcrypt ↔ outro) sem afetar domínio |
| **Desacoplamento** | Domínio não conhece Knex, bcrypt, etc |
| **Manutenibilidade** | Código organizado em responsabilidades claras |
| **Escalabilidade** | Fácil adicionar novos casos de uso e adapters |

## 📝 Exemplo de Uso

```typescript
import UsuarioCrud from "./adapters/db/UsuarioCrud";
import CriptografiaSenhaReal from "./adapters/auth/CriptografiaSenhaReal";
import CriarUsuarioUsecase from "./appcore/domain/usuario/CriarUsuarioUsecase";

// Injetar dependências
const crud = new UsuarioCrud();
const criptografia = new CriptografiaSenhaReal();
const usecase = new CriarUsuarioUsecase(crud, criptografia);

// Usar o caso de uso
try {
  const usuario = await usecase.execute("João Silva", "joao@email.com", "senha123");
  console.log("Usuário criado:", usuario);
} catch (error) {
  console.error("Erro:", error.message);
}
```

## 🧪 Exemplo de Teste

```typescript
// Mock das dependências
const mockCrud = {
  adicionar: jest.fn(),
  buscarPorEmail: jest.fn().mockResolvedValue(null),
};
const mockCriptografia = {
  criptografar: jest.fn().mockReturnValue("hash"),
  comparar: jest.fn().mockReturnValue(true),
};

const usecase = new CriarUsuarioUsecase(mockCrud, mockCriptografia);
await usecase.execute("João", "joao@email.com", "senha");

expect(mockCrud.buscarPorEmail).toHaveBeenCalledWith("joao@email.com");
expect(mockCriptografia.criptografar).toHaveBeenCalledWith("senha");
```

## 📚 Leitura Recomendada

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture - Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Knex.js Documentation](http://knexjs.org/)

## 📄 Licença

ISC

## 👤 Autor

danmaciel

---

**Última atualização**: 9 de março de 2026


## Verificações automatizadas

O workflow do GitHub Actions executa `npm ci`, `npm run build`, `npm test -- --runInBand --ci` e `npm audit --audit-level=high`.

O banco SQLite local não deve ser versionado. Execute `npm run migration:up` para inicializar a base de desenvolvimento quando necessário. O banco anteriormente presente no Git ainda pode ser encontrado no histórico antigo.

Na revisão de novembro de 2026, a auditoria de dependências passou sem alertas de severidade alta ou crítica, mas ainda reportou 16 moderados e 4 baixos (principalmente dependências transitivas de ferramentas de desenvolvimento). O controle de qualidade continua bloqueando novos alertas altos/críticos. Os alertas remanescentes devem ser acompanhados; a aprovação no CI **não** significa ausência de riscos.


### Porta de persistência orientada ao domínio

Os casos de uso dependem de `UsuarioRepository`, com métodos explícitos `buscarPorEmail(email)` e `adicionar(usuario)`. Dessa forma, eles não precisam conhecer nomes de colunas SQL nem a tecnologia de armazenamento. O adapter `UsuarioCrud` traduz esse contrato para operações Knex/SQLite.

A suíte `test/UsecasesUnit.test.ts` valida regras e falhas usando fakes em memória, **sem inicializar SQLite**. Os testes de integração com Knex permanecem separados para validar a persistência real.
