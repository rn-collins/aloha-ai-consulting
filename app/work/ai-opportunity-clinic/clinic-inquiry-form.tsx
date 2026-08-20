"use client";

import {useActionState} from "react";
import Script from "next/script";
import {submitClinicInquiry,type ClinicInquiryState} from "./actions";
import {clinicConfig} from "./clinic-config";

const initialState:ClinicInquiryState={status:"idle",message:""};
export function ClinicInquiryForm({enabled}:{enabled:boolean}) {
  const [state,action,pending]=useActionState(submitClinicInquiry,initialState);
  if (!enabled) return <div className="booking-state">
    <strong>Private-cohort inquiries are open through RN’s public LinkedIn.</strong>
    <p>The secure site form is still being configured, but you can begin a nonconfidential fit conversation now. A message is not a booking, does not reserve a date, and does not require payment.</p>
    <p><strong>Copy this message:</strong><br/>I’m interested in the Aloha AI Opportunity Clinic for a private cohort of [number, up to six]. The nonconfidential workflow we want to examine is [brief description]. We hope to make [decision or outcome] clearer. Our preferred timing is [range].</p>
    <a className="button primary" href="https://www.linkedin.com/in/rn-collins" target="_blank" rel="noreferrer">Message RN on LinkedIn ↗</a>
    <p className="quiet-note">Do not include client names, health information, credentials, privileged material, security details, regulated data, or other confidential information.</p>
  </div>;
  return <form action={action} className="clinic-inquiry">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload"/>
    <div className="form-grid">
      <label>Name<input name="name" autoComplete="name" maxLength={100} required/></label>
      <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label>
      <label>Organization or private cohort<input name="organization" autoComplete="organization" maxLength={120} required/></label>
      <label>Participants<select name="participantCount" defaultValue="" required><option value="" disabled>Select 1–{clinicConfig.maximumParticipants}</option>{Array.from({length:clinicConfig.maximumParticipants},(_,index)=><option key={index+1} value={index+1}>{index+1} · ${(index+1)*clinicConfig.pricePerParticipant}</option>)}</select></label>
    </div>
    <label>One nonconfidential workflow<textarea name="workflow" minLength={30} maxLength={1200} rows={7} required aria-describedby="workflow-help"/></label>
    <p id="workflow-help" className="quiet-note">Describe the work and desired decision—not client names, health information, credentials, privileged material, security details, or regulated data.</p>
    <label className="check-row"><input type="checkbox" name="accessConversation" value="yes"/> I want a separate follow-up about access needs. Do not describe medical details here.</label>
    <label className="check-row"><input type="checkbox" name="consent" value="yes" required/> I confirm this inquiry is nonconfidential and authorize Aloha AI to use it only to assess and respond to this Clinic request.</label>
    <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="light" aria-label="Human verification"/>
    <label className="bot-field" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button className="button primary" type="submit" disabled={pending}>{pending?"Sending…":"Send secure inquiry"}</button>
    <p className={`form-status ${state.status}`} role="status" aria-live="polite">{state.message}</p>
    <p className="quiet-note">You should receive an email with a reference number. A response is normally sent within five business days, but that timing is not guaranteed. Unaccepted inquiries are deleted within 30 days.</p>
  </form>;
}
