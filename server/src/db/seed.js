import { pool } from "./pool.js";

// Categorías y productos de ejemplo basados en el prototipo (precios en colones)
const CATEGORIAS = [
  { nombre: "Fermentados", descripcion: "Misos, salsas y alimentos fermentados tradicionales." },
  { nombre: "Aceites CBD", descripcion: "Aceites y extractos de CBD de origen natural." },
  { nombre: "Superalimentos", descripcion: "Matcha, semillas y alimentos de alta densidad nutricional." },
  { nombre: "Algas Marinas", descripcion: "Wakame, kombu y algas ricas en minerales." },
  { nombre: "Cereales y Granos", descripcion: "Arroz integral, sésamo y granos enteros." },
];

const PRODUCTOS = [
  { nombre: "Miso de Cebada", categoria: "Fermentados", precio: 8900, stock: 40, descripcion: "Pasta de miso de cebada fermentada de forma tradicional. 500 g." },
  { nombre: "Aceite CBD 15%", categoria: "Aceites CBD", precio: 35000, stock: 15, descripcion: "Aceite de CBD de espectro completo al 15%. 30 ml." },
  { nombre: "Matcha Ceremonial", categoria: "Superalimentos", precio: 18500, stock: 25, descripcion: "Té verde matcha grado ceremonial. 100 g." },
  { nombre: "Wakame Orgánico", categoria: "Algas Marinas", precio: 6900, stock: 50, descripcion: "Alga wakame deshidratada orgánica. 100 g." },
  { nombre: "Sésamo Negro Orgánico", categoria: "Cereales y Granos", precio: 4200, stock: 60, descripcion: "Semillas de sésamo negro orgánico. 250 g." },
  { nombre: "Arroz Integral Orgánico", categoria: "Cereales y Granos", precio: 3500, stock: 80, descripcion: "Arroz integral de grano largo orgánico. 1 kg." },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Inserta categorías (idempotente por nombre único) y mapea nombre -> id
    const idsPorCategoria = {};
    for (const c of CATEGORIAS) {
      const { rows } = await client.query(
        `INSERT INTO categorias (nombre, descripcion)
         VALUES ($1, $2)
         ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion
         RETURNING id`,
        [c.nombre, c.descripcion]
      );
      idsPorCategoria[c.nombre] = rows[0].id;
    }

    // Inserta productos solo si la tabla está vacía (evita duplicados al re-ejecutar)
    const { rows: conteo } = await client.query("SELECT count(*)::int AS n FROM productos");
    if (conteo[0].n === 0) {
      for (const p of PRODUCTOS) {
        await client.query(
          `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [p.nombre, p.descripcion, p.precio, p.stock, idsPorCategoria[p.categoria]]
        );
      }
      console.log(`Seed: ${CATEGORIAS.length} categorías y ${PRODUCTOS.length} productos insertados.`);
    } else {
      console.log(`Seed: ya existen ${conteo[0].n} productos, no se insertan duplicados.`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error en el seed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
