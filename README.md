# 🏗️ Arquitetura - Exemplo de Arquitetura Hexagonal/Limpa

Um projeto exemplo que demonstra os princípios de **Arquitetura Limpa** (Clean Architecture) e **Arquitetura Hexagonal** (Ports & Adapters) implementados em TypeScript.

## 📋 Visão Geral

Este projeto ilustra como desacoplar a lógica de negócio das dependências externas (banco de dados, criptografia, etc.) através de interfaces (ports) e implementações concretas (adapters).

**Caso de Uso**: Sistema de gerenciamento de usuários com autenticação.

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **TypeScript** | 5.9 | Linguagem tipada |
| **Node.js** | ESNext | Runtime JavaScript |
| **Jest** | 30.2 | Framework de testes |
| **Knex.js** | 3.1 | Query builder SQL |
| **SQLite3** | 12.6 | Banco de dados |
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
│ - CrudGenerico<T>    │→→│ - UsuarioCrud        │
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
    │       ├── CrudGenerico.ts              # Interface CRUD genérica
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
                ├── banco.sqlite3            # Banco de dados
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
interface CrudGenerico<T> {
  adicionar(item: T): Promise<T>;
  buscaPor(campo: string, valor: any): Promise<T | null>;
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

Executa todos os testes Jest com automático reload.

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
  buscaPor: jest.fn().mockResolvedValue(null),
};
const mockCriptografia = {
  criptografar: jest.fn().mockReturnValue("hash"),
  comparar: jest.fn().mockReturnValue(true),
};

const usecase = new CriarUsuarioUsecase(mockCrud, mockCriptografia);
await usecase.execute("João", "joao@email.com", "senha");

expect(mockCrud.buscaPor).toHaveBeenCalledWith("email", "joao@email.com");
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
