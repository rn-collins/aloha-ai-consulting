"use server";

import {Resend} from "resend";
import {clinicConfig, clinicEnrollmentConfigured} from "./clinic-config";

export type ClinicInquiryState = {status:"idle"|"success"|"error"; message:string};
const clean = (value:FormDataEntryValue|null, maximum:number) => typeof value === "string" ? value.trim().slice(0, maximum) : "";
const isEmail = (value:string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const siteUrl="https://aloha-ai-consulting.vercel.app";
const allowedTurnstileHostnames=()=>new Set(["aloha-ai-consulting.vercel.app",process.env.VERCEL_URL].filter((value):value is string=>Boolean(value)).map(value=>value.replace(/^https?:\/\//,"").split("/")[0].toLowerCase()));

async function isHuman(token:string) {
  if (!token) return false;
  const body=new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY!,response:token});
  try {
    const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body,cache:"no-store"});
    const result=await response.json() as {success?:boolean;hostname?:string};
    return result.success===true && Boolean(result.hostname) && allowedTurnstileHostnames().has(result.hostname!.toLowerCase());
  } catch { return false; }
}
export async function submitClinicInquiry(_previous:ClinicInquiryState, formData:FormData):Promise<ClinicInquiryState> {
  if (!clinicEnrollmentConfigured()) return {status:"error",message:"Secure inquiry is not open yet. No information was sent."};
  if (clean(formData.get("website"),200)) return {status:"success",message:"Thank you. Your inquiry has been received."};
  if (!await isHuman(clean(formData.get("cf-turnstile-response"),2048))) return {status:"error",message:"Complete the privacy-preserving human check and try again."};

  const name=clean(formData.get("name"),100);
  const email=clean(formData.get("email"),254).toLowerCase();
  const organization=clean(formData.get("organization"),120);
  const workflow=clean(formData.get("workflow"),1200);
  const participantCount=Number(clean(formData.get("participantCount"),2));
  const accessConversation=formData.get("accessConversation")==="yes";
  const consent=formData.get("consent")==="yes";
  if (!name || !isEmail(email) || !organization || workflow.length < 30) return {status:"error",message:"Complete the required fields and describe the nonconfidential workflow in at least 30 characters."};
  if (!Number.isInteger(participantCount) || participantCount < 1 || participantCount > clinicConfig.maximumParticipants) return {status:"error",message:`The Clinic supports one to ${clinicConfig.maximumParticipants} participants.`};
  if (!consent) return {status:"error",message:"Confirm that the inquiry is nonconfidential and may be used to respond to you."};

  const resend=new Resend(process.env.RESEND_API_KEY);
  const from=process.env.CLINIC_FROM_EMAIL!;
  const inbox=process.env.CLINIC_INBOX_EMAIL!;
  const duplicateWindow=new Date().toISOString().slice(0,10);
  const fingerprint=await crypto.subtle.digest("SHA-256",new TextEncoder().encode([email,organization.toLowerCase(),participantCount,workflow.toLowerCase(),duplicateWindow].join("|")));
  const fingerprintHex=Array.from(new Uint8Array(fingerprint),byte=>byte.toString(16).padStart(2,"0")).join("");
  const reference=`CL-${duplicateWindow.replaceAll("-","")}-${fingerprintHex.slice(0,10).toUpperCase()}`;
  const idempotencyKey=`clinic-inquiry-${fingerprintHex}`;
  const quoted=(value:string)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  const estimatedTotal=participantCount*clinicConfig.pricePerParticipant;
  try {
    const {error}=await resend.batch.send([
      {from,to:inbox,replyTo:email,subject:`Clinic inquiry · ${organization} · ${participantCount} participant${participantCount===1?"":"s"}`,html:`<p><strong>Reference:</strong> ${reference}</p><p><strong>Name:</strong> ${quoted(name)}</p><p><strong>Email:</strong> ${quoted(email)}</p><p><strong>Organization/cohort:</strong> ${quoted(organization)}</p><p><strong>Participants:</strong> ${participantCount}</p><p><strong>Estimated fee:</strong> $${estimatedTotal.toLocaleString("en-US")}</p><p><strong>Access conversation requested:</strong> ${accessConversation?"Yes":"No"}</p><p><strong>Nonconfidential workflow:</strong></p><p>${quoted(workflow).replaceAll("\n","<br>")}</p><p>Handle under the <a href="${siteUrl}/policies">Clinic inquiry policy</a>. Delete an unaccepted inquiry within 30 days.</p>`,text:`Aloha AI Opportunity Clinic inquiry\n\nReference: ${reference}\nName: ${name}\nEmail: ${email}\nOrganization/cohort: ${organization}\nParticipants: ${participantCount}\nEstimated fee: $${estimatedTotal.toLocaleString("en-US")}\nAccess conversation requested: ${accessConversation?"Yes":"No"}\n\nNonconfidential workflow:\n${workflow}\n\nPolicy: ${siteUrl}/policies\nDelete an unaccepted inquiry within 30 days.`},
      {from,to:email,subject:`Your Aloha AI Opportunity Clinic inquiry · ${reference}`,html:`<p>Hello ${quoted(name)},</p><p>Your nonconfidential Clinic inquiry was received. Reference: <strong>${reference}</strong>.</p><p>A response is normally sent within five business days, but that timing is not guaranteed. This is not a booking or payment confirmation. Aloha AI will first confirm fit, access needs, availability, and written terms. Do not reply with privileged, regulated, security-sensitive, health, or other confidential information.</p><p>Requested cohort size: ${participantCount}. Published fee if the scope is accepted: $${clinicConfig.pricePerParticipant} per participant ($${estimatedTotal.toLocaleString("en-US")} total).</p><p>Read the <a href="${siteUrl}/policies">Clinic inquiry policy</a> or review <a href="${siteUrl}/support">support and accessibility</a>.</p>`,text:`Hello ${name},\n\nYour nonconfidential Aloha AI Opportunity Clinic inquiry was received.\nReference: ${reference}\n\nA response is normally sent within five business days, but that timing is not guaranteed. This is not a booking or payment confirmation. Do not reply with privileged, regulated, security-sensitive, health, or other confidential information.\n\nRequested cohort size: ${participantCount}\nPublished fee if accepted: $${clinicConfig.pricePerParticipant} per participant ($${estimatedTotal.toLocaleString("en-US")} total)\n\nPolicy: ${siteUrl}/policies\nSupport and accessibility: ${siteUrl}/support`},
    ],{idempotencyKey});
    if (error) throw new Error("Resend rejected the message batch");
  } catch {
    return {status:"error",message:"The inquiry could not be sent. No booking or payment was created. Please try again later."};
  }
  return {status:"success",message:`Inquiry received. Check ${email} for reference ${reference}. No booking or payment has been created.`};
}
