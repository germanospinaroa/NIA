import fs from 'node:fs/promises';
import path from 'node:path';
import { auditCandidate, auditSemanticCandidate, canonicalConceptKey, hasSufficientContext } from '../lib/intervention-engine.ts';
import { redTeamPersons } from './redteam-persons.mjs';

try { process.loadEnvFile?.('.env.local'); } catch {}
const root = path.resolve(process.env.REDTEAM_OUTPUT_DIR || 'output/red-team');
const concurrency = Math.max(1, Number(process.env.REDTEAM_CONCURRENCY || 1));
const maxRetries = Math.max(0, Number(process.env.REDTEAM_MAX_RETRIES || 5));
const storiesPerPerson = Number(process.env.REDTEAM_STORIES_PER_PERSON || 5);
const personLimit = Number(process.env.REDTEAM_PERSON_LIMIT || redTeamPersons.length);
const controlled = process.env.REDTEAM_CONTROLLED === '1' || process.argv.includes('--controlled');
const targetPersons = redTeamPersons.slice(0, controlled ? Math.min(10, personLimit) : personLimit);
const targetStories = controlled ? Math.min(2, storiesPerPerson) : storiesPerPerson;
const key = process.env.OPENAI_API_KEY;
const chatUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions';
const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
if (!key) throw new Error('BLOCKED — missing OPENAI_API_KEY');

const candidateSchema = { type:'object', additionalProperties:false, required:['candidates'], properties:{ candidates:{ type:'array', minItems:3, maxItems:3, items:{ type:'object', additionalProperties:false, required:['text','function','concept','angle','structure'], properties:{ text:{type:'string',minLength:8,maxLength:240}, function:{type:'string',enum:['remind','anticipate','reframe','distinguish','interrupt','permit','anchor','redirect']}, concept:{type:'string',minLength:2,maxLength:120}, angle:{type:'string',minLength:2,maxLength:180}, structure:{type:'string',enum:['context_does_not_mean','before_then','you_can_without','distinguish_between','when_then','specific_permission']} } } } } };
const auditSchema = { type:'object', additionalProperties:false, required:['context_fit','specificity','generic_motivation','chatbot_language','coaching_language','therapy_language','cliché','semantic_repetition','concept_repetition','structure_repetition','single_idea','natural_voice','unnecessary_advice','approved','reasons'], properties:{ context_fit:{type:'boolean'}, specificity:{type:'boolean'}, generic_motivation:{type:'boolean'}, chatbot_language:{type:'boolean'}, coaching_language:{type:'boolean'}, therapy_language:{type:'boolean'}, cliché:{type:'boolean'}, semantic_repetition:{type:'boolean'}, concept_repetition:{type:'boolean'}, structure_repetition:{type:'boolean'}, single_idea:{type:'boolean'}, natural_voice:{type:'boolean'}, unnecessary_advice:{type:'boolean'}, approved:{type:'boolean'}, reasons:{type:'array',items:{type:'string'}} } };
const system = 'Eres el motor de intervenciones de NIA. Escribe una sola intervención breve, específica, contextual, humana y natural. No escribas motivación, coaching, terapia, explicaciones, introducciones, párrafos ni preguntas. Nunca inventes hechos personales. function y structure son identificadores internos cerrados; concept y angle son texto semántico libre.';
const stats = { api_calls:0, successful_calls:0, rate_limited:0, technical_retries:0, failed_calls:0, total_latency_ms:0, usage:{input_tokens:0,output_tokens:0,total_tokens:0} };

async function ensureFiles() {
  await fs.mkdir(root, { recursive:true });
  for (const file of ['run.json','persons.jsonl','stories.jsonl','candidates.jsonl','audits.jsonl','summary.json','human-review.csv']) { try { await fs.access(path.join(root,file)); } catch { await fs.writeFile(path.join(root,file), ''); } }
}
async function append(file, value) { await fs.appendFile(path.join(root,file), `${JSON.stringify(value)}\n`); }
async function readJsonl(file) { try { return (await fs.readFile(path.join(root,file),'utf8')).split('\n').filter(Boolean).map(line=>JSON.parse(line)); } catch { return []; } }
function sleep(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }
function retryDelay(response, attempt) { const retryAfter=response.headers.get('retry-after'); const parsed=retryAfter ? Number(retryAfter)*1000 : 0; const exponential=Math.min(120000, 1500 * (2 ** attempt)); return Math.max(parsed || 0, exponential) + Math.floor(Math.random()*500); }

async function callJson(name, schema, user, kind) {
  for (let attempt=0; attempt<=maxRetries; attempt += 1) {
    const started=Date.now(); stats.api_calls += 1;
    try {
      const response=await fetch(chatUrl,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,max_completion_tokens:1200,messages:[{role:'system',content:system},{role:'user',content:user}],response_format:{type:'json_schema',json_schema:{name,strict:true,schema}}})});
      stats.total_latency_ms += Date.now()-started;
      if ([408,429,500,502,503,504].includes(response.status)) {
        if (response.status===429) stats.rate_limited += 1;
        if (attempt<maxRetries) { stats.technical_retries += 1; await sleep(retryDelay(response,attempt)); continue; }
        stats.failed_calls += 1; return { status:'rate_limited', error:`http_${response.status}`, kind:'technical_retry', attempt:attempt+1 };
      }
      if (!response.ok) { stats.failed_calls += 1; return { status:'failed', error:`http_${response.status}`, kind:'technical_retry', attempt:attempt+1 }; }
      const payload=await response.json(); const content=payload.choices?.[0]?.message?.content;
      if (!content) { if (attempt<maxRetries) { stats.technical_retries += 1; await sleep(1500*(attempt+1)); continue; } stats.failed_calls += 1; return {status:'failed',error:'llm_empty_response',kind:'technical_retry',attempt:attempt+1}; }
      stats.successful_calls += 1; if (payload.usage) for (const field of ['prompt_tokens','completion_tokens','total_tokens']) stats.usage[field==='prompt_tokens'?'input_tokens':field==='completion_tokens'?'output_tokens':'total_tokens'] += payload.usage[field] || 0;
      return { status:'ok', value:JSON.parse(content), attempt:attempt+1, kind };
    } catch (error) {
      stats.total_latency_ms += Date.now()-started;
      if (attempt<maxRetries) { stats.technical_retries += 1; await sleep(Math.min(120000,1500*(2**attempt))+Math.floor(Math.random()*500)); continue; }
      stats.failed_calls += 1; return {status:'failed',error:error instanceof Error?error.message:String(error),kind:'technical_retry',attempt:attempt+1};
    }
  }
}
async function embedding(text) {
  for (let attempt=0; attempt<=maxRetries; attempt++) {
    const started=Date.now(); stats.api_calls++;
    const response=await fetch('https://api.openai.com/v1/embeddings',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:embeddingModel,input:text})});
    stats.total_latency_ms += Date.now()-started;
    if ([408,429,500,502,503,504].includes(response.status)) { if(response.status===429) stats.rate_limited++; if(attempt<maxRetries){stats.technical_retries++;await sleep(retryDelay(response,attempt));continue;} stats.failed_calls++; return {status:'rate_limited',error:`http_${response.status}`}; }
    if(!response.ok){stats.failed_calls++;return {status:'failed',error:`http_${response.status}`};}
    stats.successful_calls++; return {status:'ok',value:(await response.json()).data?.[0]?.embedding||[]};
  }
}
function cosine(a,b){let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return aa&&bb?dot/Math.sqrt(aa*bb):0;}
function primaryLayer(det,sem,llm){if(!det.approved)return 'deterministic';if(!sem.approved)return 'semantic';if(!llm||!llm.approved)return 'llm';return null;}
function csv(value){return `"${String(value??'').replaceAll('"','""')}"`;}
async function writeHumanReview(rows) {
  const header=['review_id','person_id','story_id','candidate_id','context','desired_change','candidate_text','function','concept','angle','structure','deterministic_result','semantic_result','llm_result','final_result','rejection_reason','human_verdict','relevant','specific','natural','original','non_coaching','non_chatbot','useful','one_idea'];
  const lines=[header.join(',')]; for(const row of rows.slice(0,Math.max(50,Math.min(100,rows.length)))) lines.push([row.candidate_id,row.person_id,row.story_id,row.candidate_id,row.active_context,row.desired_change,row.text,row.function,row.concept,row.angle,row.structure,row.deterministic_result,row.semantic_result,row.llm_result,row.final_result,row.all_rejection_reasons.join('; '),'','','','','','','','',''].map(csv).join(','));
  await fs.writeFile(path.join(root,'human-review.csv'),`${lines.join('\n')}\n`);
}
async function persistSummary(completedStories, candidates) {
  const funnel={generated_candidates:candidates.length,deterministic_rejected:candidates.filter(x=>x.primary_rejection_layer==='deterministic').length,semantic_rejected:candidates.filter(x=>x.primary_rejection_layer==='semantic').length,llm_rejected:candidates.filter(x=>x.primary_rejection_layer==='llm').length,approved:candidates.filter(x=>x.final_result==='APPROVED').length,no_approved_intervention:completedStories.filter(x=>x.final_status==='no_approved_intervention').length};
  const rounds={}; for(const row of completedStories){const r=rounds[row.round]??={stories:0,approved:0,no_approved:0};r.stories++;if(row.final_status==='approved')r.approved++;if(row.final_status==='no_approved_intervention')r.no_approved++;}
  const summary={updated_at:new Date().toISOString(),provider:{...stats,average_latency_ms:stats.api_calls?Math.round(stats.total_latency_ms/stats.api_calls):0,model,embedding_model:embeddingModel},dataset:{persons:targetPersons.length,target_stories:targetPersons.length*targetStories,completed:completedStories.length,remaining:targetPersons.length*targetStories-completedStories.length},funnel,rounds,concept_saturation:candidates.filter(x=>x.concept_saturation_triggered).length,semantic_duplicate:candidates.filter(x=>x.semantic_duplicate).length,structure_repetition:candidates.filter(x=>x.structure_repetition).length};
  await fs.writeFile(path.join(root,'summary.json'),JSON.stringify(summary,null,2)); return summary;
}

await ensureFiles();
const existingStories=await readJsonl('stories.jsonl'); const existingIds=new Set(existingStories.map(x=>x.story_id));
try {
  const previous=JSON.parse(await fs.readFile(path.join(root,'summary.json'),'utf8'));
  const provider=previous.provider;
  if (provider) {
    stats.api_calls=provider.api_calls||0; stats.successful_calls=provider.successful_calls||0; stats.rate_limited=provider.rate_limited||0; stats.technical_retries=provider.technical_retries||0; stats.failed_calls=provider.failed_calls||0; stats.total_latency_ms=(provider.average_latency_ms||0)*(provider.api_calls||0); stats.usage={...(provider.usage||{})};
  }
} catch {}
if (!(await fs.readFile(path.join(root,'persons.jsonl'),'utf8')).trim()) for(const person of targetPersons) await append('persons.jsonl',person);
const run={run_id:process.env.REDTEAM_RUN_ID||`redteam-${new Date().toISOString().replaceAll(/[^0-9]/g,'').slice(0,14)}`,started_at:new Date().toISOString(),concurrency,controlled,stories_per_person:targetStories,provider:model,embedding_model:embeddingModel}; await fs.writeFile(path.join(root,'run.json'),JSON.stringify(run,null,2));
const histories=new Map();
for(const person of targetPersons){const history=histories.get(person.id)||[];for(let round=1;round<=targetStories;round++){
  const story_id=`${person.id}-story-${String(round).padStart(3,'0')}`; if(existingIds.has(story_id)) continue;
  const brief={desiredChange:person.desired_change,currentContext:person.current_context,relevantSituations:person.current_context?[person.current_context]:[],recurringPatterns:history.map(x=>`${x.concept}:${x.angle}`),userLanguage:[],recentInterventions:history.map(x=>x.text),recentConcepts:history.map(x=>x.concept),recentAngles:history.map(x=>x.angle),recentStructures:history.map(x=>x.structure),learningSignals:[],generationConstraints:person.context_level==='insufficient'?[]:['No inventes contexto personal no confirmado.'],feedback:null};
  const sufficiency=hasSufficientContext(brief); const gen=await callJson('redteam_candidates',candidateSchema,`Genera exactamente 3 candidatos. Objetivo: ${person.desired_change}. Contexto confirmado: ${person.current_context||'ninguno'}. Historial: ${JSON.stringify(history.slice(-4))}. Contexto suficiente: ${sufficiency.sufficient}. Si no hay contexto suficiente, no inventes uno.`, 'generation');
  if(gen.status!=='ok'){const story={story_id,person_id:person.id,round,desired_change:person.desired_change,active_context:person.current_context,brief,final_status:gen.status,error:gen.error};await append('stories.jsonl',story);existingIds.add(story_id);continue;}
  let approved=null; const storyCandidates=[];
  for(let index=0;index<gen.value.candidates.length;index++){
    const raw=gen.value.candidates[index]; const candidate_id=`${story_id}-candidate-${index+1}`; const candidate={...raw,conceptKey:canonicalConceptKey(raw.concept)}; const det=auditCandidate(candidate,brief); const emb=await embedding(candidate.text); let semantic={approved:false,reasons:['embedding_unavailable'],hard_failures:['embedding_unavailable'],warnings:[],similarity:0,similarInterventions:[],checks:{},semanticStatus:'fail'};
    if(emb.status==='ok'){const matches=[];for(const previous of history){if(previous.embedding)matches.push({intervention_id:previous.id,text:previous.text,similarity:cosine(emb.value,previous.embedding),concept:previous.concept,angle:previous.angle});}semantic=auditSemanticCandidate(candidate,matches);}
    const aud=semantic.approved?await callJson('redteam_audit',auditSchema,`Audita sin inventar hechos personales y sin exigir datos que la usuaria no dio. Brief: ${JSON.stringify({desired_change:person.desired_change,current_context:person.current_context,relevant_context:[person.current_context],candidate,recent_interventions:history.map(x=>x.text),recent_concepts:history.map(x=>x.concept),recent_structures:history.map(x=>x.structure)})}`,'quality_audit'):null;
    const llm=aud?.status==='ok'?aud.value:null; const final=det.approved&&semantic.approved&&Boolean(llm?.approved); const primary=primaryLayer(det,semantic,llm); const reasons=[...det.reasons,...semantic.reasons,...(llm?.reasons||[])]; const record={candidate_id,story_id,person_id:person.id,round,text:candidate.text,function:candidate.function,concept:candidate.concept,angle:candidate.angle,structure:candidate.structure,generation_attempt:gen.attempt,deterministic_result:det.approved?'PASS':'FAIL',semantic_result:semantic.approved?'PASS':'FAIL',llm_result:llm?llm.approved?'PASS':'FAIL':'NO_RUN',final_result:final?'APPROVED':'REJECTED',primary_rejection_layer:primary,all_rejection_reasons:reasons,concept_key:candidate.conceptKey,concept_saturation_triggered:reasons.includes('concept_saturated'),semantic_duplicate:reasons.includes('semantic_duplicate'),structure_repetition:reasons.includes('semantic_structure_reuse'),audit_results:{deterministic:det,semantic,llm}}; await append('candidates.jsonl',record);await append('audits.jsonl',{candidate_id,story_id,deterministic:det,semantic,llm,primary_rejection_layer:primary,all_rejection_reasons:reasons});storyCandidates.push(record);if(final&&!approved)approved={...record,embedding:emb.value};
  }
  const story={story_id,person_id:person.id,round,desired_change:person.desired_change,active_context:person.current_context,context_history:history.map(x=>x.active_context),learning_signals:[],brief,generation_attempt:gen.attempt,candidates:storyCandidates.map(x=>x.candidate_id),selected_intervention:approved?.text||null,final_status:approved?'approved':'no_approved_intervention'}; await append('stories.jsonl',story);existingIds.add(story_id);if(approved)history.push({id:approved.candidate_id,text:approved.text,concept:approved.concept,angle:approved.angle,structure:approved.structure,embedding:approved.embedding,active_context:person.current_context}); await persistSummary(await readJsonl('stories.jsonl'),await readJsonl('candidates.jsonl')); console.log(JSON.stringify({story_id,final_status:story.final_status}));
}}
const allStories=await readJsonl('stories.jsonl');const allCandidates=await readJsonl('candidates.jsonl');const summary=await persistSummary(allStories,allCandidates);await writeHumanReview(allCandidates);await fs.writeFile(path.join(root,'run.json'),JSON.stringify({...run,finished_at:new Date().toISOString(),summary},null,2));console.log(JSON.stringify(summary));
