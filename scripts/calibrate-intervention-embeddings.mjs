import assert from 'node:assert/strict';

const model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('BLOCKED — missing OPENAI_API_KEY');

const pairs = [
  ['duplicate', 'Confía en tu criterio.', 'Confía en tu propio criterio.'],
  ['duplicate', 'No necesitas aprobación para decidir.', 'No necesitas que te aprueben para tomar una decisión.'],
  ['duplicate', 'Puedes decir que no sin justificarte.', 'Puedes negarte sin dar explicaciones.'],
  ['duplicate', 'Antes de responder, date un momento.', 'Tómate un momento antes de contestar.'],
  ['duplicate', 'Que cuestionen tu decisión no significa que esté mal.', 'Que pongan en duda tu decisión no quiere decir que sea incorrecta.'],
  ['duplicate', 'No tienes que aceptar por compromiso.', 'No necesitas decir que sí solo por compromiso.'],
  ['duplicate', 'Puedes cambiar de opinión.', 'Tienes permiso para reconsiderar tu decisión.'],
  ['duplicate', 'Decir no también es una decisión.', 'Negarte también cuenta como decidir.'],
  ['duplicate', 'No todo desacuerdo exige que cambies de criterio.', 'Un desacuerdo no te obliga a cambiar de opinión.'],
  ['duplicate', 'Puedes pedir tiempo antes de contestar.', 'Puedes esperar antes de dar una respuesta.'],
  ['same_concept', 'Confía en tu criterio.', 'No necesitas aprobación para tomar una decisión.'],
  ['same_concept', 'Puedes decir que no sin justificarte.', 'Que alguien se moleste no convierte tu límite en un error.'],
  ['same_concept', 'Antes de responder, date un momento.', 'No tienes que resolver la incomodidad de inmediato.'],
  ['same_concept', 'Que cuestionen tu decisión no significa que esté mal.', 'Puedes escuchar una opinión sin convertirla en tu respuesta.'],
  ['same_concept', 'No tienes que aceptar por compromiso.', 'Puedes cuidar el vínculo sin decir que sí a todo.'],
  ['same_concept', 'Puedes cambiar de opinión.', 'Reconsiderar no borra que antes hayas elegido.'],
  ['same_concept', 'Decir no también es una decisión.', 'Poner un límite puede ser una forma de cuidar tu tiempo.'],
  ['same_concept', 'No todo desacuerdo exige que cambies de criterio.', 'La duda de otra persona no reemplaza lo que tú sabes.'],
  ['same_concept', 'Puedes pedir tiempo antes de contestar.', 'No tienes que responder mientras todavía estás ordenando lo que piensas.'],
  ['same_concept', 'No necesitas explicar cada decisión.', 'Tu respuesta puede ser breve aunque la otra persona quiera más razones.'],
  ['same_topic_different_concept', 'Confía en tu criterio.', 'No tienes que justificar cada decisión que tomas.'],
  ['same_topic_different_concept', 'Puedes decir que no sin justificarte.', 'Decidir cuándo descansar también es cuidar tu energía.'],
  ['same_topic_different_concept', 'Antes de responder, date un momento.', 'Una respuesta clara puede esperar a que tengas la información necesaria.'],
  ['same_topic_different_concept', 'Que cuestionen tu decisión no significa que esté mal.', 'Si falta información, pedirla no es buscar aprobación.'],
  ['same_topic_different_concept', 'No tienes que aceptar por compromiso.', 'Cumplir lo que prometiste puede requerir reorganizar tu agenda.'],
  ['same_topic_different_concept', 'Puedes cambiar de opinión.', 'Reconocer un error no define todo lo que haces.'],
  ['same_topic_different_concept', 'Decir no también es una decisión.', 'Elegir cuándo hablar puede evitar una reacción impulsiva.'],
  ['same_topic_different_concept', 'No todo desacuerdo exige que cambies de criterio.', 'Escuchar una crítica puede ayudarte a encontrar un dato que faltaba.'],
  ['same_topic_different_concept', 'Puedes pedir tiempo antes de contestar.', 'Aclarar una fecha evita aceptar algo que no puedes cumplir.'],
  ['same_topic_different_concept', 'No necesitas explicar cada decisión.', 'Una conversación difícil también necesita un momento adecuado.'],
  ['unrelated', 'Que tu jefe cuestione tu decisión no significa que esté equivocada.', 'Hoy intenta dejar el teléfono lejos mientras almuerzas.'],
  ['unrelated', 'Puedes decir que no sin justificarte.', 'La lluvia puede cambiar el horario de una caminata.'],
  ['unrelated', 'Antes de responder, date un momento.', 'Revisa que la planta reciba suficiente luz.'],
  ['unrelated', 'No necesitas aprobación para decidir.', 'El tren de las ocho suele llegar al andén tres.'],
  ['unrelated', 'Poner un límite no te convierte en mala persona.', 'Guarda las llaves en el mismo lugar al llegar.'],
  ['unrelated', 'Puedes cambiar de opinión.', 'La receta necesita diez minutos más de horno.'],
  ['unrelated', 'Decir no también es una decisión.', 'El informe debe tener la fecha en la portada.'],
  ['unrelated', 'No todo desacuerdo exige que cambies de criterio.', 'Compra jabón antes de volver a casa.'],
  ['unrelated', 'Puedes pedir tiempo antes de contestar.', 'El autobús pasa cada veinte minutos.'],
  ['unrelated', 'No necesitas explicar cada decisión.', 'El perro necesita salir antes de la cena.'],
];

function cosine(a, b) {
  let dot = 0; let left = 0; let right = 0;
  for (let index = 0; index < a.length; index += 1) { dot += a[index] * b[index]; left += a[index] ** 2; right += b[index] ** 2; }
  return dot / (Math.sqrt(left) * Math.sqrt(right));
}

function percentile(values, fraction) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * fraction;
  const lower = Math.floor(index); const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

const texts = [...new Set(pairs.flatMap(([, left, right]) => [left, right]))];
const response = await fetch('https://api.openai.com/v1/embeddings', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, input: texts }) });
if (!response.ok) throw new Error(`embedding_http_${response.status}`);
const payload = await response.json();
const vectors = new Map(payload.data.map(item => [texts[item.index], item.embedding]));
assert.equal(vectors.size, texts.length);

const results = pairs.map(([label, left, right]) => ({ label, left, right, similarity: cosine(vectors.get(left), vectors.get(right)) }));
for (const label of ['duplicate', 'same_concept', 'same_topic_different_concept', 'unrelated']) {
  const values = results.filter(item => item.label === label).map(item => item.similarity);
  console.log(JSON.stringify({ label, count: values.length, min: Math.min(...values), max: Math.max(...values), median: percentile(values, 0.5), p25: percentile(values, 0.25), p75: percentile(values, 0.75) }));
}
console.log(JSON.stringify({ model, pairs: results }));
