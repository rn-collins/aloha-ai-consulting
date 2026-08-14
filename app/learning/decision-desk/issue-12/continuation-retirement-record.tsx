"use client";
import {useEffect,useMemo,useState} from "react";

const KEY="aloha-ai:decision-desk:continuation-retirement-record:v1";
const evidenceAreas=["Purpose and accountable owner","Outcome and quality evidence","Harm, incident, and complaint record","Authority, data, and affected-party conditions","Exact provider, model, and configuration","Human capability and operational dependence","Rollback, replacement, and exit readiness"];
const gates=["Current evidence","Still authorized","Benefit persists","Harm controlled","Challenge works","Exit is executable"];
const options=["Current and supported","Concern or degradation","Missing or stale","Not applicable—explain"];
type State={matrix:Record<string,string>;records:Record<string,string>;disposition:string};
const empty:State={matrix:{},records:{},disposition:""};

export function ContinuationRetirementRecord(){
 const [state,setState]=useState<State>(empty),[ready,setReady]=useState(false),[message,setMessage]=useState("Your record stays in this browser.");
 useEffect(()=>{const t=setTimeout(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setState(JSON.parse(raw))}catch{}setReady(true)},0);return()=>clearTimeout(t)},[]);
 useEffect(()=>{if(ready)localStorage.setItem(KEY,JSON.stringify(state))},[ready,state]);
 const values=Object.values(state.matrix),filled=values.length,total=evidenceAreas.length*gates.length;
 const floor=useMemo(()=>{
  if(values.some(v=>v==="Concern or degradation"))return "Pause expansion and begin controlled repair, rollback, replacement, or retirement review.";
  if(values.some(v=>v==="Missing or stale")||filled<total)return "Do not presume continuation. Freeze expansion and resolve missing or stale evidence.";
  if(filled===total)return "All matrix cells are addressed. Continuation may be considered only with current authority, named owners, monitoring, exit readiness, and organizational approval.";
  return "Complete the evidence matrix before selecting a disposition.";
 },[values,filled,total]);
 function download(){
  const content=`# AI Continuation and Retirement Decision Record

Exported: ${new Date().toISOString()}

Educational decision aid only. Not legal, privacy, security, procurement, employment, accessibility, records, financial, safety, or organizational approval.

## Provisional decision floor
${floor}

${evidenceAreas.map(area=>`## ${area}
${gates.map(g=>`- ${g}: ${state.matrix[`${area}::${g}`]||"Unresolved"}`).join("\n")}`).join("\n\n")}

## Exact AI use, purpose, people, owner, and authoritative record
${state.records.system||"Not recorded"}

## Current outcome, quality, harm, incident, complaint, and override evidence
${state.records.evidence||"Not recorded"}

## Authority, data, provider, model, configuration, and dependency changes
${state.records.change||"Not recorded"}

## Rollback, replacement, data return/deletion, continuity, and archive plan
${state.records.exit||"Not recorded"}

## Notice, challenge, support, monitoring, stop owner, and next review
${state.records.control||"Not recorded"}

## Selected bounded disposition
${state.disposition||"Not selected"}`;
  const url=URL.createObjectURL(new Blob([content],{type:"text/markdown"})),a=document.createElement("a");a.href=url;a.download="ai-continuation-retirement-decision-record.md";a.click();URL.revokeObjectURL(url);setMessage("Continuation and Retirement Record downloaded.");
 }
 function clear(){if(!confirm("Delete this Continuation and Retirement Record from this browser?"))return;localStorage.removeItem(KEY);setState(empty);setMessage("Local record deleted.");}
 return <section className="wrap decision-builder" id="instrument"><p className="section-label">Interactive instrument · device-local</p><div className="section-head"><div><h2>AI Continuation and Retirement Decision Record</h2><p>Use a fictional or nonsensitive system description only. Do not enter credentials, personal data, confidential records, incident details, contracts, privileged material, or security information.</p></div><div className="masterclass-meter"><strong>{filled}/{total}</strong><span>continuation gates addressed</span><progress max={total} value={filled}/></div></div><div className="booking-state"><strong>Past approval is not permanent permission.</strong><br/>{floor}</div><div className="support-matrix" role="region" aria-label="AI continuation and retirement evidence matrix" tabIndex={0}><table><thead><tr><th>Evidence area</th>{gates.map(g=><th key={g}>{g}</th>)}</tr></thead><tbody>{evidenceAreas.map(area=><tr key={area}><th>{area}</th>{gates.map(g=><td key={g}><label><span className="sr-only">{area}: {g}</span><select value={state.matrix[`${area}::${g}`]||""} onChange={e=>setState(s=>({...s,matrix:{...s.matrix,[`${area}::${g}`]:e.target.value}}))}><option value="">Unresolved</option>{options.map(o=><option key={o}>{o}</option>)}</select></label></td>)}</tr>)}</tbody></table></div><div className="record-fields">{[
  ["system","Exact AI use, purpose, people, owner, and authoritative record","Name the bounded use, intended outcome, affected people, accountable owner, human decision owner, authoritative record, exclusions, and what the system must never do."],
  ["evidence","Current outcome, quality, harm, incident, complaint, and override evidence","Record dated measures, representative tests, subgroup effects, errors, incidents, complaints, challenges, overrides, workarounds, monitoring gaps, and disconfirming evidence."],
  ["change","Authority, data, provider, model, configuration, and dependency changes","Record changes in law or policy, consent or expectations, data flow, retention, training/reuse, provider terms, subprocessors, model, prompts, integrations, access, staffing, and operational dependence."],
  ["exit","Rollback, replacement, data return/deletion, continuity, and archive plan","Identify the last known safe state, manual fallback, replacement path, data export and deletion, vendor exit, records preservation, service continuity, verification steps, owners, dates, and irreversibilities."],
  ["control","Notice, challenge, support, monitoring, stop owner, and next review","Record affected-party notice, nonretaliatory challenge, correction, support, incident escalation, stop authority, approval owner, monitoring cadence, review trigger, and next dated review."]
 ].map(([key,title,help])=><article className="record-section" key={key}><label><span>{title}</span><small>{help}</small><textarea value={state.records[key]||""} onChange={e=>setState(s=>({...s,records:{...s.records,[key]:e.target.value}}))}/></label></article>)}</div><fieldset className="knowledge-question"><legend>Bounded disposition</legend>{[
  "Continue this exact use with conditions, monitoring, and a dated review",
  "Pause expansion and repair before any continuation decision",
  "Roll back or replace the exact use under a controlled transition",
  "Retire the exact use, preserve required records, and verify exit"
 ].map(x=><label key={x}><input type="radio" name="retirement-outcome" checked={state.disposition===x} onChange={()=>setState(s=>({...s,disposition:x}))}/>{x}</label>)}</fieldset><p className="booking-state"><strong>Selection does not override the evidence floor.</strong><br/>A “continue” selection is only a proposed record. It is not approval and does not cure a concern, stale evidence, missing authority, unsafe dependence, or an untested exit.</p><div className="course-actions workspace-actions"><button className="button primary" onClick={download}>Export Decision Record</button><button className="text-button danger-action" onClick={clear}>Delete local record</button></div><p className="action-status" aria-live="polite">{ready?message:"Restoring your local record…"}</p></section>;
}
