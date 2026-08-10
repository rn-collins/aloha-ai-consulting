"use client";

import {useEffect, useMemo, useState} from "react";

const STORAGE_KEY="aloha-ai:citation-verifier:v1";
const lessonTitles=[
  "The five different citation failures","The verification contract","Choose the data path before the model","Create the review-unit schema",
  "Build a transparent citation parser","Bind each citation to the proposition","Rank sources by authority and purpose","Retrieve, normalize, and preserve",
  "Locate the supporting passage","Compare claim, qualification, and conflict","Use a verdict taxonomy that cannot hide uncertainty","Produce an inspectable review report",
  "Keep professional responsibility with the professional","Design the audit and change record","Build the failure-focused test set","Measure dangerous errors",
  "Choose prototype, pilot, or deployment","Defend the system without overselling it"
];

const questions=[
  {prompt:"A citation is correctly formatted, but the cited decision does not establish the sentence's proposition. Which layer failed?",options:["Citation form","Source existence","Proposition support","Document retention"],answer:2,reason:"Correct form and source existence do not establish that the authority supports the proposition."},
  {prompt:"A retrieval service returns no result. What is the bounded disposition?",options:["Unsupported","No source located","Contradicted","Supported with qualification"],answer:1,reason:"No match establishes only that the approved retrieval path located no source; it does not prove nonexistence or contradiction."},
  {prompt:"What should happen when one sentence contains multiple claims and the citation mapping is unclear?",options:["Use the nearest citation","Let the model choose","Split the review units or mark the mapping ambiguous","Remove the sentence"],answer:2,reason:"The mapping must remain inspectable; proximity cannot silently become evidentiary support."},
  {prompt:"Which result is safest when the source context needed for comparison is incomplete?",options:["High-confidence support","Abstain and identify the missing context","Infer from the headnote","Average other model outputs"],answer:1,reason:"Missing evidence requires an explicit abstention and next step, not manufactured confidence."},
  {prompt:"Why evaluate results by failure class instead of publishing one accuracy number?",options:["It produces a larger number","It exposes dangerous false passes and coverage gaps","It eliminates human review","It avoids keeping a test set"],answer:1,reason:"Aggregate accuracy can conceal the error types that create false assurance."},
  {prompt:"Who owns the final release decision for high-stakes professional work?",options:["The language model","The retrieval vendor","A named authorized human reviewer","The learner's browser"],answer:2,reason:"The tool assists inquiry; responsibility remains with a capable, authorized human reviewer."}
];

type SavedState={completed:number[];answers:Record<number,number>;updatedAt:string};
const emptyState:SavedState={completed:[],answers:{},updatedAt:""};

const labKit=`# Citation Verifier Lab Kit\n\nThis workbook accompanies Aloha AI's open Citation Verifier course reader. It is an independent learning aid, not legal advice, grading, certification, or proof of competence. Use synthetic or public material unless your authority, confidentiality, retention, and supervision boundaries are resolved.\n\n## 1. Verification contract\n- Accepted inputs:\n- Covered citation families:\n- Approved sources and authority order:\n- Permitted verdicts:\n- Evidence returned with each verdict:\n- Abstention rules:\n- Named reviewer and release authority:\n- Explicit non-goals:\n\n## 2. Data-flow record\nMap: input → parsing → retrieval → comparison → human review → export → logs → deletion. For each boundary, record operator, system, data class, retention, and authorization.\n\n## 3. Review-unit schema\nDocument/version ID; exact proposition; original citation; normalized citation; source and retrieval time; located passage and locator; provisional verdict; reason; limitations; reviewer disposition; release status; tool/ruleset version.\n\n## 4. Failure-focused test set\nInclude: valid citation; malformed form; nonexistent authority; wrong metadata; inaccurate quotation; overstatement; contradiction; ambiguous mapping; unavailable source; unsupported format. Keep labels independent of the system.\n\n## 5. Evaluation table\nFor each failure class record total cases, false passes, false flags, abstentions, reviewer disagreements, and release consequence. Do not collapse the result into one accuracy number.\n\n## 6. Deployment memo\nStatus (prototype/pilot/deployment); permitted users and data; tested capabilities; exclusions; human gate; monitoring; rollback trigger; evidence required to advance.\n\n## 7. Capstone defense\nDemonstrate one supported result and one abstention. Explain what the system cannot establish and what happens when evidence is missing.\n`;

export function CourseWorkspace(){
  const [state,setState]=useState<SavedState>(emptyState);
  const [ready,setReady]=useState(false);
  const [message,setMessage]=useState("Progress is stored only in this browser.");
  useEffect(()=>{const restore=window.setTimeout(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)setState(JSON.parse(raw));}catch{}setReady(true)},0);return()=>window.clearTimeout(restore)},[]);
  useEffect(()=>{if(!ready)return;const next={...state,updatedAt:new Date().toISOString()};localStorage.setItem(STORAGE_KEY,JSON.stringify(next));},[state,ready]);
  const score=useMemo(()=>questions.reduce((total,q,index)=>total+(state.answers[index]===q.answer?1:0),0),[state.answers]);
  const answered=Object.keys(state.answers).length;
  function toggle(index:number){setState(current=>({...current,completed:current.completed.includes(index)?current.completed.filter(item=>item!==index):[...current.completed,index].sort((a,b)=>a-b)}));}
  function download(name:string,content:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const link=document.createElement("a");link.href=url;link.download=name;link.click();URL.revokeObjectURL(url);setMessage(`${name} downloaded.`)}
  function exportRecord(){const record={recordType:"Aloha AI self-directed learning record",course:"Build a Trust-Safe Citation Verifier",version:1,exportedAt:new Date().toISOString(),learnerAttestation:"Self-recorded; not verified, graded, certified, or credentialed by Aloha AI.",completedLessons:state.completed.map(index=>({lesson:index+1,title:lessonTitles[index]})),knowledgeCheck:{answered,total:questions.length,score,responses:questions.map((q,index)=>({question:q.prompt,selected:state.answers[index]===undefined?null:q.options[state.answers[index]],correct:state.answers[index]===q.answer}))}};download("citation-verifier-learning-record.json",JSON.stringify(record,null,2),"application/json")}
  function clearRecord(){if(!window.confirm("Clear this course record and knowledge-check answers from this browser?"))return;localStorage.removeItem(STORAGE_KEY);setState(emptyState);setMessage("Local course record cleared.")}
  return <section className="wrap course-workspace" aria-labelledby="workspace-title">
    <p className="section-label">Self-directed workspace · browser-local</p><h2 id="workspace-title">Practice, check, and keep your own record.</h2>
    <div className="booking-state"><strong>No account and no submission.</strong><br/>Selections remain in this browser. Aloha AI does not receive, grade, verify, or certify them.</div>
    <div className="course-progress" aria-live="polite"><span>{state.completed.length} of 18 lessons marked complete</span><progress max="18" value={state.completed.length}>{state.completed.length} of 18</progress></div>
    <div className="course-workspace-grid">
      <article><h3>Lesson record</h3><p>Mark a lesson after completing its reading and practice. This is a personal checklist, not evidence of mastery.</p><ol className="lesson-checklist">{lessonTitles.map((title,index)=><li key={title}><label><input type="checkbox" checked={state.completed.includes(index)} onChange={()=>toggle(index)}/><span><small>Lesson {Math.floor(index/2)+1}.{index%2+1}</small>{title}</span></label></li>)}</ol></article>
      <article><h3>Executable knowledge check</h3><p>Six questions test the course boundaries. Feedback appears immediately; you may revise any answer.</p>{questions.map((question,index)=><fieldset className="knowledge-question" key={question.prompt}><legend>{index+1}. {question.prompt}</legend>{question.options.map((option,optionIndex)=><label key={option}><input type="radio" name={`question-${index}`} checked={state.answers[index]===optionIndex} onChange={()=>setState(current=>({...current,answers:{...current.answers,[index]:optionIndex}}))}/>{option}</label>)}{state.answers[index]!==undefined&&<p className={state.answers[index]===question.answer?"feedback correct":"feedback review"}><strong>{state.answers[index]===question.answer?"Correct.":"Review this."}</strong> {question.reason}</p>}</fieldset>)}<p className="knowledge-score" aria-live="polite">Current result: <strong>{score}/{questions.length}</strong> correct · {answered}/{questions.length} answered. This result is self-recorded and is not a grade or credential.</p></article>
    </div>
    <div className="course-actions"><button className="button primary" type="button" onClick={()=>download("citation-verifier-lab-kit.md",labKit,"text/markdown")}>Download lab kit</button><button className="button" type="button" onClick={exportRecord}>Export learning record</button><button className="text-button" type="button" onClick={clearRecord}>Clear local record</button></div><p className="action-status" aria-live="polite">{message}</p>
  </section>
}
