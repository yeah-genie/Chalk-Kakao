"use strict";(()=>{var e={};e.id=462,e.ids=[462],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},843:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>h,patchFetch:()=>f,requestAsyncStorage:()=>d,routeModule:()=>l,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u});var o={};r.r(o),r.d(o,{POST:()=>p});var n=r(3278),a=r(5002),i=r(4877),s=r(1309);let c=new(r(1540)).$D(process.env.GEMINI_API_KEY||"");async function p(e){try{let t;let{image:r,problemText:o,correctAnswer:n}=await e.json();if(!r)return s.NextResponse.json({error:"Image is required"},{status:400});let a=(t=`You are a math tutor analyzing a student's handwritten solution.

TASK:
1. Recognize and transcribe the handwritten math work
2. Break it into numbered steps
3. Identify if/where an error occurred
4. Classify the error type and explain why it happened

`,o&&(t+=`PROBLEM: ${o}
`),n&&(t+=`CORRECT ANSWER: ${n}
`),t+=`
ERROR TYPES (classify the error as ONE of these):
- conceptual: Student doesn't understand the underlying concept
- procedural: Student knows the concept but applied wrong method/steps
- factual: Simple memorization error (e.g., 7\xd78=54 instead of 56)
- careless: Silly mistake, sign error, copying error

RESPOND IN THIS EXACT JSON FORMAT:
{
  "recognizedText": "Full text of the student's work, line by line",
  "steps": [
    {"stepNumber": 1, "content": "step content", "isCorrect": true},
    {"stepNumber": 2, "content": "step content", "isCorrect": false, "expected": "what it should be"}
  ],
  "errorStep": 2,
  "misconception": {
    "code": "ERROR_CODE",
    "name": "Short name of the misconception",
    "type": "conceptual|procedural|factual|careless",
    "description": "Detailed explanation of why this error happened",
    "recommendation": "What the student should practice to fix this"
  },
  "overallFeedback": "Summary feedback for the student",
  "confidence": 85
}

If the solution is COMPLETELY CORRECT, set errorStep to null and misconception to null.

IMPORTANT:
- Be specific about WHERE the error occurred
- Explain WHY the student likely made this mistake
- Give actionable advice to prevent it

Analyze the handwritten work in the image:`),i=c.getGenerativeModel({model:"gemini-1.5-flash"}),p=[{inlineData:{data:r.replace(/^data:image\/\w+;base64,/,""),mimeType:"image/png"}}],l=await i.generateContent([a,...p]),d=(await l.response).text(),u=function(e){try{let r=e.match(/\{[\s\S]*\}/);if(r){var t;let e=JSON.parse(r[0]);return{recognizedText:e.recognizedText||"",steps:(e.steps||[]).map((e,t)=>({stepNumber:e.stepNumber||t+1,content:e.content||"",isCorrect:!1!==e.isCorrect,expected:e.expected})),errorStep:e.errorStep||null,misconception:e.misconception?{code:e.misconception.code||"UNKNOWN",name:e.misconception.name||"Error",type:(t=e.misconception.type,["conceptual","procedural","factual","careless"].includes(t)?t:"careless"),description:e.misconception.description||"",recommendation:e.misconception.recommendation||""}:null,overallFeedback:e.overallFeedback||"",confidence:e.confidence||70}}}catch(e){console.error("Failed to parse response:",e)}return{recognizedText:e,steps:[],errorStep:null,misconception:null,overallFeedback:"Could not parse the solution. Please try again with a clearer image.",confidence:0}}(d);return s.NextResponse.json({success:!0,analysis:u,rawResponse:d})}catch(e){return console.error("Analysis error:",e),s.NextResponse.json({error:"Failed to analyze homework",details:String(e)},{status:500})}}let l=new n.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/homework/route",pathname:"/api/homework",filename:"route",bundlePath:"app/api/homework/route"},resolvedPagePath:"C:\\Users\\yejin\\Downloads\\cryo\\chalk-canvas\\app\\api\\homework\\route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:d,staticGenerationAsyncStorage:u,serverHooks:m}=l,h="/api/homework/route";function f(){return(0,i.patchFetch)({serverHooks:m,staticGenerationAsyncStorage:u})}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[787,833,540],()=>r(843));module.exports=o})();