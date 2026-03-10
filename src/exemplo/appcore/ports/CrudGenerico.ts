export default interface CrudGenerico<T> {
    adicionar(item: T): Promise<T>;
    buscaPor(campo: string, valor: any): Promise<T | null>;
}