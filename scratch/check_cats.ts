
import { buscarCategorias } from "./lib/services/category-service";

async function test() {
    const cats = await buscarCategorias();
    console.log("Categorias encontradas:", JSON.stringify(cats, null, 2));
}

test();
