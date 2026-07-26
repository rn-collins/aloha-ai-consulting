const crypto=require('crypto');

class WorkflowError extends Error{constructor(code,message,details={}){super(message);this.code=code;this.details=details}}
const now=()=>new Date().toISOString();

function validateWorkflow(definition){
 if(!definition?.key||!definition?.version)throw new WorkflowError('invalid_workflow','Workflow key and version are required');
 if(!Array.isArray(definition.steps)||!definition.steps.length)throw new WorkflowError('invalid_workflow','At least one workflow step is required');
 const keys=new Set();
 definition.steps.forEach((step,index)=>{
  if(!step?.key||typeof step.run!=='function')throw new WorkflowError('invalid_step',`Step ${index} requires key and run`);
  if(keys.has(step.key))throw new WorkflowError('duplicate_step',`Duplicate step ${step.key}`);
  keys.add(step.key);
 });
 return definition;
}

function createRunRecord({definition,input,context={}}){
 validateWorkflow(definition);
 return {id:crypto.randomUUID(),workflowKey:definition.key,workflowVersion:definition.version,status:'queued',input,inputHash:crypto.createHash('sha256').update(JSON.stringify(input??{})).digest('hex'),context,steps:[],createdAt:now(),startedAt:null,completedAt:null};
}

async function executeWorkflow({definition,input,context={},onEvent=async()=>{}}){
 const run=createRunRecord({definition,input,context});
 run.status='running';run.startedAt=now();
 await onEvent({type:'run.started',run:{...run}});
 let state={input,context,outputs:{}};
 for(let position=0;position<definition.steps.length;position++){
  const step=definition.steps[position];
  const record={key:step.key,position,status:'running',startedAt:now(),completedAt:null,output:null,error:null};
  run.steps.push(record);await onEvent({type:'step.started',runId:run.id,step:{...record}});
  try{
   const output=await step.run(Object.freeze({...state,runId:run.id,stepKey:step.key}));
   record.output=output??null;record.status='completed';record.completedAt=now();state={...state,outputs:{...state.outputs,[step.key]:output}};
   await onEvent({type:'step.completed',runId:run.id,step:{...record}});
   if(output?.requiresHumanReview){run.status='awaiting_review';run.completedAt=now();await onEvent({type:'run.awaiting_review',run:{...run}});return run}
  }catch(error){
   record.status='failed';record.completedAt=now();record.error={code:error.code||'step_failed',message:error.message,details:error.details||{}};
   run.status='failed';run.completedAt=now();await onEvent({type:'step.failed',runId:run.id,step:{...record}});await onEvent({type:'run.failed',run:{...run}});return run;
  }
 }
 run.status='completed';run.completedAt=now();await onEvent({type:'run.completed',run:{...run}});return run;
}

module.exports={WorkflowError,validateWorkflow,createRunRecord,executeWorkflow};