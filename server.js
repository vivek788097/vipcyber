const express=require("express"),session=require("express-session"),bcrypt=require("bcryptjs"),fs=require("fs"),path=require("path");
const app=express(),PORT=process.env.PORT||3000,DB=path.join(__dirname,"data.json");
const ADMIN_ID=process.env.ADMIN_ID||"admin",ADMIN_HASH=process.env.ADMIN_PASSWORD_HASH||bcrypt.hashSync(process.env.ADMIN_PASSWORD||"VIP@2026",12);
const SERVICES=["online","bank","bill","print","flight","train","recharge","due","reminder","other"];
function db(){let x=JSON.parse(fs.readFileSync(DB,"utf8"));x.serviceData??={};for(const s of SERVICES)x.serviceData[s]??=[];x.otherLinks??=[];return x}
function save(x){fs.writeFileSync(DB,JSON.stringify(x,null,2))}
app.use(express.json());app.use(express.urlencoded({extended:false}));
app.use(session({secret:process.env.SESSION_SECRET||"CHANGE_THIS_TO_A_LONG_RANDOM_SECRET",resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:14400000}}));
app.use(express.static(path.join(__dirname,"public")));
function auth(req,res,next){if(req.session.user)return next();res.status(401).json({ok:false,message:"Unauthorized"})}
function admin(req,res,next){if(req.session.user?.role==="admin")return next();res.status(403).json({ok:false,message:"Admin only"})}

app.post("/api/login",(q,r)=>{const id=String(q.body.loginId||"").trim(),pw=String(q.body.password||"");
if(id===ADMIN_ID&&bcrypt.compareSync(pw,ADMIN_HASH)){q.session.user={id,role:"admin",services:SERVICES};return r.json({ok:true,role:"admin"})}
const u=db().operators.find(x=>x.id===id&&x.active!==false);
if(u&&bcrypt.compareSync(pw,u.passwordHash)){q.session.user={id:u.id,name:u.name,role:"operator",services:u.services||[]};return r.json({ok:true,role:"operator"})}
r.status(401).json({ok:false,message:"Login ID या Password गलत है।"})});
app.post("/api/logout",(q,r)=>q.session.destroy(()=>r.json({ok:true})));
app.get("/admin",auth,(q,r)=>r.sendFile(path.join(__dirname,"public","admin.html")));
app.get("/operator",auth,(q,r)=>r.sendFile(path.join(__dirname,"public","operator.html")));

app.get("/api/my-services",auth,(q,r)=>r.json({services:q.session.user.services||[]}));
app.get("/api/operators",auth,admin,(q,r)=>r.json({operators:db().operators.map(x=>({id:x.id,name:x.name,active:x.active!==false,services:x.services||[]}))}));
app.post("/api/operators",auth,admin,(q,r)=>{const d=db(),id=String(q.body.id||"").trim(),name=String(q.body.name||"").trim(),pw=String(q.body.password||""),services=Array.isArray(q.body.services)?q.body.services.filter(x=>SERVICES.includes(x)):[];
if(!/^[A-Za-z0-9_.-]{3,30}$/.test(id))return r.status(400).json({ok:false,message:"Operator ID 3-30 characters का रखें।"});
if(pw.length<8)return r.status(400).json({ok:false,message:"Password कम से कम 8 characters का होना चाहिए।"});
if(id===ADMIN_ID||d.operators.some(x=>x.id===id))return r.status(409).json({ok:false,message:"Operator ID पहले से मौजूद है।"});
d.operators.push({id,name:name||id,passwordHash:bcrypt.hashSync(pw,12),services,active:true});save(d);r.json({ok:true})});
app.patch("/api/operators/:id",auth,admin,(q,r)=>{const d=db(),u=d.operators.find(x=>x.id===q.params.id);if(!u)return r.status(404).json({ok:false,message:"Operator नहीं मिला।"});
if(Array.isArray(q.body.services))u.services=q.body.services.filter(x=>SERVICES.includes(x));if(typeof q.body.active==="boolean")u.active=q.body.active;
if(q.body.password){if(String(q.body.password).length<8)return r.status(400).json({ok:false,message:"Password 8+ characters का होना चाहिए।"});u.passwordHash=bcrypt.hashSync(String(q.body.password),12)}
save(d);r.json({ok:true})});
app.delete("/api/operators/:id",auth,admin,(q,r)=>{const d=db(),n=d.operators.filter(x=>x.id!==q.params.id);if(n.length===d.operators.length)return r.status(404).json({ok:false,message:"Operator नहीं मिला।"});d.operators=n;save(d);r.json({ok:true})});

app.get("/api/reminders",auth,admin,(q,r)=>{
 const d=db(),today=new Date();today.setHours(0,0,0,0);
 const rows=[...(d.serviceData.due||[]),...(d.serviceData.reminder||[])];
 const items=rows.map(x=>{let days=null,status="no-date";if(x.dueDate){const dt=new Date(x.dueDate+"T00:00:00");if(!isNaN(dt)){days=Math.round((dt-today)/86400000);status=days<0?"overdue":days===0?"today":days<=3?"soon":"upcoming"}}return {...x,days,status}}).filter(x=>x.days!==null).sort((a,b)=>a.days-b.days);
 r.json({items});
});
app.get("/api/data/:service",auth,(q,r)=>{const s=q.params.service;if(!SERVICES.includes(s))return r.status(400).json({ok:false});r.json({items:db().serviceData[s]||[]})});
app.post("/api/data/:service",auth,(q,r)=>{const s=q.params.service;if(!SERVICES.includes(s))return r.status(400).json({ok:false});const d=db();d.serviceData[s].push({...q.body,id:Date.now()+Math.floor(Math.random()*1000),createdAt:new Date().toISOString(),by:q.session.user.id});save(d);r.json({ok:true})});
app.delete("/api/data/:service/:id",auth,(q,r)=>{const s=q.params.service,id=Number(q.params.id),d=db();d.serviceData[s]=(d.serviceData[s]||[]).filter(x=>x.id!==id);save(d);r.json({ok:true})});

app.get("/api/other-links",auth,(q,r)=>r.json({links:db().otherLinks}));
app.post("/api/other-links",auth,admin,(q,r)=>{const name=String(q.body.name||"").trim(),url=String(q.body.url||"").trim();if(!name||!/^https?:\/\//i.test(url))return r.status(400).json({ok:false,message:"Name और valid http/https link दें।"});const d=db();d.otherLinks.push({id:Date.now(),name,url});save(d);r.json({ok:true})});
app.delete("/api/other-links/:id",auth,admin,(q,r)=>{const d=db();d.otherLinks=d.otherLinks.filter(x=>x.id!==Number(q.params.id));save(d);r.json({ok:true})});


app.get("/api/bank-links",auth,(q,r)=>r.json({links:db().bankLinks||[]}));
app.post("/api/bank-links",auth,admin,(q,r)=>{
 const name=String(q.body.name||"").trim(),url=String(q.body.url||"").trim();
 if(!name||!/^https?:\/\//i.test(url)) return r.status(400).json({ok:false,message:"Bank Service का नाम और valid http/https link दें।"});
 const d=db(); d.bankLinks??=[]; d.bankLinks.push({id:Date.now(),name,url}); save(d); r.json({ok:true});
});
app.delete("/api/bank-links/:id",auth,admin,(q,r)=>{
 const d=db(); d.bankLinks=(d.bankLinks||[]).filter(x=>x.id!==Number(q.params.id)); save(d); r.json({ok:true});
});

app.listen(PORT,()=>console.log(`VIP Cyber Cafe running at http://localhost:${PORT}`));
