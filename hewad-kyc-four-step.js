/* HEWAD COIN — approved four-step KYC flow and verification gates */
(function () {
  'use strict';
  const overlay = document.getElementById('kycScreen');
  if (!overlay) return;
  const countries = ['Afghanistan','Pakistan','India','Iran','United Arab Emirates','Saudi Arabia','Turkey','United States','United Kingdom','Canada','Australia','Germany','France','China','Russia','Qatar','Kuwait','Oman','Bahrain','Malaysia','Indonesia','Bangladesh','Nepal','Other'];
  const dialCodes = {'Afghanistan':'+93','Pakistan':'+92','India':'+91','Iran':'+98','United Arab Emirates':'+971','Saudi Arabia':'+966','Turkey':'+90','United States':'+1','United Kingdom':'+44','Canada':'+1','Australia':'+61','Germany':'+49','France':'+33','China':'+86','Russia':'+7','Qatar':'+974','Kuwait':'+965','Oman':'+968','Bahrain':'+973','Malaysia':'+60','Indonesia':'+62','Bangladesh':'+880','Nepal':'+977'};
  const countryFlags = {'Afghanistan':'🇦🇫','Pakistan':'🇵🇰','India':'🇮🇳','Iran':'🇮🇷','United Arab Emirates':'🇦🇪','Saudi Arabia':'🇸🇦','Turkey':'🇹🇷','United States':'🇺🇸','United Kingdom':'🇬🇧','Canada':'🇨🇦','Australia':'🇦🇺','Germany':'🇩🇪','France':'🇫🇷','China':'🇨🇳','Russia':'🇷🇺','Qatar':'🇶🇦','Kuwait':'🇰🇼','Oman':'🇴🇲','Bahrain':'🇧🇭','Malaysia':'🇲🇾','Indonesia':'🇮🇩','Bangladesh':'🇧🇩','Nepal':'🇳🇵'};
  const provinces = ['Badakhshan','Badghis','Baghlan','Balkh','Bamyan','Daykundi','Farah','Faryab','Ghazni','Ghor','Helmand','Herat','Jowzjan','Kabul','Kandahar','Kapisa','Khost','Kunar','Kunduz','Laghman','Logar','Nangarhar','Nimroz','Nuristan','Paktia','Paktika','Panjshir','Parwan','Samangan','Sar-e Pol','Takhar','Uruzgan','Wardak','Zabul'];
  const state = {type:'',step:1,values:{},files:{},submitting:false};
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const status = () => String(window.HEWAD_KYC_STATUS || 'not_verified');
  const isApproved = () => status() === 'approved';

  const style = document.createElement('style');
  style.id = 'hwc-kyc-four-step-styles';
  style.textContent = '#kycScreen{z-index:100000;padding:12px 10px;align-items:flex-start;background:rgba(2,7,8,.82);backdrop-filter:blur(7px)}#kycScreen .hwc-kyc-premium-panel{width:min(100%,520px);padding:15px 14px 18px;border:1px solid #d3b45d;border-radius:20px;background:var(--hwc-card,#151a20);color:var(--hwc-text,#f4f1e9);box-shadow:0 22px 70px #0009}.hwc-kyc-topline{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.hwc-kyc-topline b{font-size:11px;letter-spacing:1.6px;color:#d9b75c}.hwc-kyc-home{border:0;background:transparent;color:#d9b75c;font-size:11px;font-weight:800;padding:6px 0}.hwc-kyc-green-card{min-height:112px;border-radius:15px;padding:13px 15px;background:linear-gradient(135deg,#176044,#0c382b 72%,#102b24);color:#fff;box-shadow:inset 0 1px #ffffff30,0 8px 20px #0003}.hwc-kyc-green-card h3{margin:0 0 5px;color:#fff;font-size:16px;letter-spacing:0}.hwc-kyc-green-card p{margin:0;color:#dcece4;font-size:10px;line-height:1.5}.hwc-kyc-steps{display:flex;align-items:center;gap:7px;margin-top:12px}.hwc-kyc-steps span{width:23px;height:23px;flex:0 0 23px;border-radius:50%;display:grid;place-items:center;background:#ffffff25;color:#fff;font-size:10px;font-weight:900}.hwc-kyc-steps span.active{background:#f2c94c;color:#1b1b1b}.hwc-kyc-steps i{height:2px;flex:1;background:#ffffff35}.hwc-kyc-body{padding:12px 2px 0}.hwc-kyc-body h4{margin:3px 0 8px;font-size:14px;color:var(--hwc-text,#f4f1e9)}.hwc-kyc-help{margin:0 0 10px;color:var(--hwc-muted,#aab1bc);font-size:10px;line-height:1.55}.hwc-kyc-body label{display:block;margin:10px 0;color:var(--hwc-text,#e8e8e8);font-size:11px;font-weight:750}.hwc-kyc-body input,.hwc-kyc-body select{box-sizing:border-box;width:100%;margin-top:5px;padding:11px 12px;border:1px solid var(--hwc-border,#454b55);border-radius:10px;background:var(--hwc-input-bg,#10151b);color:var(--hwc-text,#fff);font:inherit;font-size:12px}.hwc-kyc-body input[type=file]{padding:9px;font-size:10px}.hwc-kyc-photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hwc-kyc-photo{min-width:0;padding:10px 7px;border:1px dashed #a78a42;border-radius:11px;background:#c9a33a0b}.hwc-kyc-photo b{display:block;margin-bottom:5px;font-size:10px;color:#d8b85d}.hwc-kyc-photo small{display:block;min-height:26px;color:var(--hwc-muted,#aab1bc);font-size:9px;line-height:1.35}.hwc-kyc-actions{display:flex;gap:9px;margin-top:15px}.hwc-kyc-actions button{flex:1;min-width:0;border:0;border-radius:11px;padding:12px 9px;font-size:11px;font-weight:900;cursor:pointer}.hwc-kyc-yellow{background:linear-gradient(135deg,#ffe28a,#d6a52c);color:#241b08;box-shadow:0 5px 14px #c99b2933}.hwc-kyc-back{background:transparent;border:1px solid var(--hwc-border,#454b55)!important;color:var(--hwc-text,#e9e9e9)}.hwc-kyc-choice{display:flex;align-items:center;gap:12px;width:100%;margin:10px 0;padding:14px;border:1px solid var(--hwc-border,#414751);border-radius:14px;background:var(--hwc-card-2,#1c232b);color:var(--hwc-text,#fff);text-align:left}.hwc-kyc-choice-icon{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;border-radius:13px;background:#c69b2b20;color:#e3c16a;font-size:25px}.hwc-kyc-choice-copy{flex:1;min-width:0}.hwc-kyc-choice-copy b{display:block;font-size:12px}.hwc-kyc-choice-copy small{display:block;margin-top:4px;color:var(--hwc-muted,#aab1bc);font-size:10px}.hwc-kyc-choice-count{font-size:9px;color:#d8b75c;font-weight:800}.hwc-kyc-review{display:grid;gap:7px}.hwc-kyc-review-row{display:flex;justify-content:space-between;gap:10px;padding:9px 10px;border:1px solid var(--hwc-border,#414751);border-radius:9px;font-size:10px}.hwc-kyc-review-row span{color:var(--hwc-muted,#aab1bc)}.hwc-kyc-review-row b{max-width:62%;text-align:right;overflow-wrap:anywhere}.hwc-kyc-status{padding:20px 12px;text-align:center;border:1px solid #c59a3c55;border-radius:14px;background:#c59a3c0d}.hwc-kyc-status strong{display:block;margin-bottom:7px;color:#e4c56d;font-size:15px}.hwc-kyc-status p{margin:0;color:var(--hwc-muted,#aab1bc);font-size:11px;line-height:1.6}.hwc-country-dial{min-width:42px;height:27px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;border-radius:7px;border:1px solid #f1d27a;background:linear-gradient(135deg,#f9e5a0,#b17b13 50%,#fff0ac);color:#251a08;font-size:10px;font-weight:900}.hwc-copy[hidden]{display:none!important}body.theme-light #kycScreen .hwc-kyc-premium-panel{background:#fff;color:#202630}body.theme-light .hwc-kyc-body h4,body.theme-light .hwc-kyc-body label{color:#202630}body.theme-light .hwc-kyc-body input,body.theme-light .hwc-kyc-body select{background:#f7f8fa;color:#202630;border-color:#d9dde4}body.theme-light .hwc-kyc-choice{background:#f8f9fb;color:#202630;border-color:#e0e3e8}body.theme-light .hwc-kyc-review-row{border-color:#e0e3e8}@media(max-width:370px){.hwc-kyc-photo-grid{grid-template-columns:1fr}.hwc-kyc-photo small{min-height:0}.hwc-kyc-green-card{min-height:106px}}';
  document.head.appendChild(style);

  function closeKyc(goHome) {
    overlay.hidden = true; overlay.innerHTML = ''; document.body.style.overflow = '';
    if (goHome !== false) {
      document.querySelectorAll('#dashboard .dash-subpage').forEach(el=>el.classList.remove('active'));
      const home=document.getElementById('dashboardMain'); if(home)home.classList.add('active');
      const card=document.getElementById('memberCard'); if(card)card.hidden=false;
      document.querySelectorAll('.dash-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab==='dashboard'));
      window.scrollTo(0,0);
    }
  }
  function panel(content) {
    overlay.hidden=false; document.body.style.overflow='hidden';
    overlay.innerHTML='<div class="kyc-panel hwc-kyc-premium-panel" role="dialog" aria-modal="true" aria-label="KYC verification"><div class="hwc-kyc-topline"><b>HEWAD COIN · KYC</b><button class="hwc-kyc-home" type="button" data-kyc-home>اصلي صفحې ته</button></div>'+content+'</div>';
  }
  function renderStatus(s, reason) {
    const approved=s==='approved', pending=s==='pending';
    panel('<div class="hwc-kyc-status"><strong>'+(approved?'✓ هویت مو تأیید شوی':pending?'⏳ د هویت غوښتنه تر ارزونې لاندې ده':'د KYC بیا غوښتنه')+'</strong><p>'+(approved?'ستاسو حساب تصدیق شوی او د کارت اسانتیاوې فعالې دي.':pending?'ستاسو اسناد اډمین ته رسېدلي دي. د ارزونې تر بشپړېدو پورې انتظار وکړئ.':'ستاسو پخوانۍ غوښتنه رد شوې ده. د رد دلیل: '+esc(reason||'له ملاتړ سره اړیکه ونیسئ')+'. تاسو کولای شئ معلومات اصلاح او بیا یې ولېږئ.')+'</p></div>'+(approved||pending?'':'<button type="button" class="hwc-kyc-yellow" style="width:100%;margin-top:12px;padding:13px;border:0;border-radius:10px;font-weight:900" data-kyc-restart>بیا غوښتنه وکړئ</button>'));
  }
  async function openKyc() {
    if (!hwcCurrentUser) { if(typeof showNotice==='function')showNotice('Please log in to continue.'); return; }
    try {
      const result=await hwcSupabase.from('kyc_applications').select('status,rejection_reason').eq('user_id',hwcCurrentUser.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(result.error)throw result.error;
      const latest=result.data;
      let current=latest&&latest.status;
      if(!current){const profileStatus=await hwcSupabase.from('profiles').select('kyc_status').eq('id',hwcCurrentUser.id).maybeSingle();if(profileStatus.error)throw profileStatus.error;current=profileStatus.data&&profileStatus.data.kyc_status||window.HEWAD_KYC_STATUS||'not_verified';}
      window.HEWAD_KYC_STATUS=current;
      if(current==='approved'||current==='pending'){renderStatus(current,latest&&latest.rejection_reason);return;}
      if(current==='rejected'){renderStatus('rejected',latest&&latest.rejection_reason);return;}
      state.type='';state.step=1;state.values={};state.files={};renderChoice();
    } catch(error) { if(typeof showNotice==='function')showNotice(error.message||'Could not load KYC status.'); }
  }
  function renderChoice() {
    panel('<div class="hwc-kyc-body" dir="rtl"><h4>د هویت سند انتخاب کړئ</h4><p class="hwc-kyc-help">د کارت اضافه کولو لپاره د خپل سند ډول وټاکئ.</p><button type="button" class="hwc-kyc-choice" data-kyc-doc="tazkira"><span class="hwc-kyc-choice-icon">▣</span><span class="hwc-kyc-choice-copy"><b>برېښنايي تذکره</b><small>د تذکرې له لارې د هویت تصدیق</small></span><span class="hwc-kyc-choice-count">۴ مرحلې ›</span></button><button type="button" class="hwc-kyc-choice" data-kyc-doc="passport"><span class="hwc-kyc-choice-icon">▤</span><span class="hwc-kyc-choice-copy"><b>پاسپورټ</b><small>د پاسپورټ له لارې د هویت تصدیق</small></span><span class="hwc-kyc-choice-count">۴ مرحلې ›</span></button><p class="hwc-kyc-help">ستاسو شخصي معلومات او اسناد په خوندي ډول ساتل کېږي.</p></div>');
  }
  function greenCard() {
    const titles=['شخصي معلومات','د استوګنې معلومات','د اسنادو عکسونه','وروستۍ بیاکتنه'];
    const hints=['خپل معلومات د هویت له سند سره سم ولیکئ.','د خپل اوسني استوګنځي معلومات وټاکئ.','د سند روښانه او بشپړ عکسونه پورته کړئ.','ټول معلومات او عکسونه یو ځل بیا وګورئ.'];
    let dots=''; for(let i=1;i<=4;i++){dots+='<span class="'+(i===state.step?'active':'')+'">'+i+'</span>';if(i<4)dots+='<i></i>';}
    return '<div class="hwc-kyc-green-card" dir="rtl"><h3>د '+(state.type==='tazkira'?'تذکرې':'پاسپورټ')+' تصدیق</h3><p>'+titles[state.step-1]+' — '+hints[state.step-1]+'</p><div class="hwc-kyc-steps">'+dots+'</div></div>';
  }
  function renderStep() {
    const v=state.values; let body='';
    if(state.step===1){
      body='<h4>شخصي معلومات</h4><label>د '+(state.type==='tazkira'?'تذکرې':'پاسپورټ')+' شمېره یا ID<input name="document_number" required maxlength="100" value="'+esc(v.document_number)+'"></label><label>نوم<input name="first_name" required maxlength="80" value="'+esc(v.first_name)+'"></label><label>تخلص<input name="last_name" required maxlength="80" value="'+esc(v.last_name)+'"></label><label>د زېږېدو نېټه<input name="date_of_birth" type="date" required value="'+esc(v.date_of_birth)+'"></label>'+(state.type==='passport'?'<label>د پاسپورټ د ختمېدو نېټه<input name="passport_expiry_date" type="date" required value="'+esc(v.passport_expiry_date)+'"></label>':'');
    } else if(state.step===2){
      body='<h4>د استوګنې معلومات</h4><label>هېواد<select name="country" required><option value="">هېواد انتخاب کړئ</option>'+countries.map(c=>'<option value="'+esc(c)+'" '+(v.country===c?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label>'+(v.country==='Afghanistan'?'<label>ولایت<select name="province" required><option value="">ولایت انتخاب کړئ</option>'+provinces.map(p=>'<option value="'+esc(p)+'" '+(v.province===p?'selected':'')+'>'+esc(p)+'</option>').join('')+'</select></label>':'<label>ولایت / سیمه<input name="province" required maxlength="100" value="'+esc(v.province)+'"></label>');
    } else if(state.step===3){
      const photo=(name,title,help)=>'<div class="hwc-kyc-photo"><b>'+title+'</b><small>'+(state.files[name]?esc(state.files[name].name):help)+'</small><input type="file" name="'+name+'" accept="image/jpeg,image/png,image/webp" capture="'+(name==='selfie'?'user':'environment')+'" required></div>';
      body='<h4>د اسنادو عکسونه</h4><p class="hwc-kyc-help">یوازې JPG، PNG یا WebP عکسونه؛ هر عکس تر ۱۰ MB پورې.</p><div class="hwc-kyc-photo-grid">'+(state.type==='tazkira'?photo('front','مخکینی عکس','د تذکرې مخ')+photo('back','شاتنی عکس','د تذکرې شا'):photo('passport_page','د معلوماتو لرونکې پاڼې عکس','یوازې هغه پاڼه چې نوم او عکس پکې وي'))+photo('selfie','شخصي سلفي','مخ باید روښانه ښکاره وي')+'</div>';
    } else {
      const rows=[['د سند ډول',state.type==='tazkira'?'برېښنايي تذکره':'پاسپورټ'],[(state.type==='tazkira'?'د تذکرې ID':'د پاسپورټ شمېره'),v.document_number],['نوم',v.first_name],['تخلص',v.last_name],['د زېږېدو نېټه',v.date_of_birth],['هېواد',v.country],['ولایت',v.province]];
      if(state.type==='passport')rows.push(['د ختمېدو نېټه',v.passport_expiry_date]);
      const names=state.type==='tazkira'?[['مخکینی عکس',state.files.front],['شاتنی عکس',state.files.back],['سلفي عکس',state.files.selfie]]:[['د معلوماتو لرونکې پاڼې عکس',state.files.passport_page],['سلفي عکس',state.files.selfie]];
      body='<h4>وروستۍ بیاکتنه</h4><div class="hwc-kyc-review">'+rows.map(r=>'<div class="hwc-kyc-review-row"><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join('')+names.map(r=>'<div class="hwc-kyc-review-row"><span>'+esc(r[0])+'</span><b>'+esc(r[1]&&r[1].name)+'</b></div>').join('')+'</div><p class="hwc-kyc-help" style="margin-top:10px">د لېږلو وروسته به اډمین ستاسو غوښتنه وارزوي. تر تأیید مخکې حساب تصدیق شوی نه وي.</p>';
    }
    const back=state.step>1?'<button type="button" class="hwc-kyc-back" data-kyc-back>مخکینۍ صفحه</button>':'';
    const action=state.step<4?'<button type="button" class="hwc-kyc-yellow" data-kyc-next>بلې صفحې ته</button>':'<button type="button" class="hwc-kyc-yellow" data-kyc-edit>اصلاح</button><button type="button" class="hwc-kyc-yellow" data-kyc-submit>تأیید او لېږل</button>';
    panel(greenCard()+'<div class="hwc-kyc-body" dir="rtl"><form id="hwcKycStepForm" novalidate>'+body+'<div class="hwc-kyc-actions">'+back+action+'</div></form></div>');
  }
  function readStep(){
    const form=overlay.querySelector('form'); if(!form)return;
    const data=new FormData(form);
    ['document_number','first_name','last_name','date_of_birth','passport_expiry_date','country','province'].forEach(k=>{if(data.has(k))state.values[k]=String(data.get(k)||'').trim();});
  }
  function validateStep(){
    const fields=Array.from(overlay.querySelectorAll('.hwc-kyc-body input:not([type=file]),.hwc-kyc-body select'));
    for(const field of fields){if(!field.reportValidity())return false;}
    if(state.step===1&&state.type==='passport'&&state.values.passport_expiry_date<=new Date().toISOString().slice(0,10)){if(typeof showNotice==='function')showNotice('د پاسپورټ د ختمېدو نېټه باید راتلونکې نېټه وي.');return false;}
    return true;
  }
  function validateFiles(){
    const keys=state.type==='tazkira'?['front','back','selfie']:['passport_page','selfie'];
    for(const key of keys){const file=state.files[key];if(!file){if(typeof showNotice==='function')showNotice('مهرباني وکړئ ټول اړین عکسونه پورته کړئ.');return false;}if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>10*1024*1024){if(typeof showNotice==='function')showNotice('عکس باید JPG، PNG یا WebP وي او تر ۱۰ MB زیات نه وي.');return false;}}
    return true;
  }
  async function submitKyc(){
    if(state.submitting)return;state.submitting=true;
    const button=overlay.querySelector('[data-kyc-submit]');if(button){button.disabled=true;button.textContent='لېږل کېږي…';}
    const uploaded=[];
    try{
      const profileResult=await hwcSupabase.from('profiles').select('mobile_number').eq('id',hwcCurrentUser.id).maybeSingle();
      if(profileResult.error)throw profileResult.error;
      const keys=state.type==='tazkira'?['front','back','selfie']:['passport_page','selfie'];
      const kinds=state.type==='tazkira'?['front','back','selfie']:['passport','selfie'];
      const paths={};
      for(let i=0;i<keys.length;i++){
        const file=state.files[keys[i]],safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-70);
        const path=hwcCurrentUser.id+'/'+Date.now()+'_'+kinds[i]+'_'+safe;
        const result=await hwcSupabase.storage.from('kyc-documents').upload(path,file,{upsert:false,contentType:file.type});
        if(result.error)throw result.error;uploaded.push(path);paths[keys[i]]=path;
      }
      const insert=await hwcSupabase.from('kyc_applications').insert({
        user_id:hwcCurrentUser.id,first_name:state.values.first_name,last_name:state.values.last_name,
        country:state.values.country,province:state.values.province,
        mobile_number:profileResult.data&&profileResult.data.mobile_number||null,
        document_type:state.type==='tazkira'?'National ID / Tazkira':'Passport',
        national_id_number:state.values.document_number,date_of_birth:state.values.date_of_birth,
        passport_expiry_date:state.type==='passport'?state.values.passport_expiry_date:null,
        front_document_path:state.type==='tazkira'?paths.front:paths.passport_page,
        back_document_path:state.type==='tazkira'?paths.back:null,selfie_document_path:paths.selfie
      });
      if(insert.error)throw insert.error;
      const update=await hwcSupabase.from('profiles').update({first_name:state.values.first_name,last_name:state.values.last_name,kyc_country:state.values.country,province:state.values.province}).eq('id',hwcCurrentUser.id);
      if(update.error)console.warn('KYC profile details:',update.error.message);
      window.HEWAD_KYC_STATUS='pending';
      if(typeof loadHwcProfile==='function')await loadHwcProfile(hwcCurrentUser);
      renderStatus('pending','');
      if(typeof showNotice==='function')showNotice('د KYC غوښتنه په بریالیتوب ولېږل شوه.');
    }catch(error){
      for(const path of uploaded){try{await hwcSupabase.storage.from('kyc-documents').remove([path]);}catch(_){}}
      if(typeof showNotice==='function')showNotice(error.message||'KYC submission failed.');
      if(button){button.disabled=false;button.textContent='تأیید او لېږل';}
    }finally{state.submitting=false;}
  }
  overlay.addEventListener('click',function(event){
    const home=event.target.closest('[data-kyc-home]');if(home){closeKyc(true);return;}
    const restart=event.target.closest('[data-kyc-restart]');if(restart){state.type='';state.step=1;state.values={};state.files={};renderChoice();return;}
    const choice=event.target.closest('[data-kyc-doc]');if(choice){state.type=choice.dataset.kycDoc;state.step=1;state.values={};state.files={};renderStep();return;}
    const next=event.target.closest('[data-kyc-next]');if(next){readStep();if(!validateStep())return;if(state.step===3&&!validateFiles())return;state.step=Math.min(4,state.step+1);renderStep();return;}
    const back=event.target.closest('[data-kyc-back]');if(back){readStep();state.step=Math.max(1,state.step-1);renderStep();return;}
    const edit=event.target.closest('[data-kyc-edit]');if(edit){state.step=1;renderStep();return;}
    const submit=event.target.closest('[data-kyc-submit]');if(submit){submitKyc();return;}
  });
  overlay.addEventListener('change',function(event){
    const input=event.target;
    if(input&&input.type==='file'&&input.files&&input.files[0]){state.files[input.name]=input.files[0];const small=input.closest('.hwc-kyc-photo')&&input.closest('.hwc-kyc-photo').querySelector('small');if(small)small.textContent=input.files[0].name;}
    if(input&&input.name==='country'){state.values.country=input.value;state.values.province='';renderStep();}
  });
  window.renderHwcKycFlow=openKyc;
  window.openHwcKyc=openKyc;

  // Replace the legacy demo KYC click handlers with the production four-step flow.
  document.addEventListener('click',function(event){
    const trigger=event.target.closest&&event.target.closest('#addCardBtn,#kycProfileRow');
    if(!trigger)return;
    event.preventDefault();event.stopPropagation();
    if(event.stopImmediatePropagation)event.stopImmediatePropagation();
    openKyc();
  },true);

  const lockedActions=['Deposit','Withdraw','Mining','Gift','Gift Code','Wallet','AFN Wallet','Send Hewad'];
  const locked=action=>!isApproved()&&lockedActions.includes(action);
  const originalOpen=window.openHwcModule;
  if(typeof originalOpen==='function')window.openHwcModule=async function(action){if(locked(action))return openKyc();return originalOpen.apply(this,arguments);};

  document.addEventListener('click',function(event){
    const target=event.target;
    const nav=target.closest&&target.closest('[data-tab="wallet"]');
    const action=target.closest&&target.closest('[data-action]');
    const walletAction=target.closest&&target.closest('#walletUsdtDeposit,#walletUsdtWithdraw,#walletSendHewad');
    const cardCopy=target.closest&&target.closest('#copyCardNumber');
    const cardNumber=target.closest&&target.closest('#memberCardNumber');
    if((nav||walletAction||cardCopy||cardNumber||(action&&locked(action.dataset.action)))&&!isApproved()){
      event.preventDefault();event.stopPropagation();if(event.stopImmediatePropagation)event.stopImmediatePropagation();openKyc();
    }
  },true);

  function refreshCard(){
    const country=document.getElementById('memberCountry'),dial=document.getElementById('memberDialCode');
    const statusEl=document.getElementById('cardKycStatus'),number=document.getElementById('memberCardNumber'),copy=document.getElementById('copyCardNumber');
    if(dial&&country){const selected=country.textContent.trim();const flag=countryFlags[selected]||'🌐';const code=dialCodes[selected]||'';dial.textContent=code?flag+' '+code:flag;dial.setAttribute('aria-label',selected+' country flag and calling code');}
    if(!number||!statusEl)return;
    if(number.textContent.trim()!=='KYC REQUIRED'&&number.textContent.trim()!=='—')number.dataset.memberNumber=number.textContent.trim();
    const approved=window.HEWAD_KYC_STATUS==='approved'||statusEl.textContent.trim()==='ACTIVE';
    if(approved){if(number.dataset.memberNumber)number.textContent=number.dataset.memberNumber;if(copy)copy.hidden=false;}
    else{number.textContent='KYC REQUIRED';if(copy)copy.hidden=true;}
  }
  const cardObserver=new MutationObserver(refreshCard);
  ['memberCountry','memberCardNumber','cardKycStatus'].forEach(id=>{const el=document.getElementById(id);if(el)cardObserver.observe(el,{childList:true,characterData:true,subtree:true});});
  refreshCard();
  const profileStatus=document.getElementById('profileKycStatus');
  if(profileStatus){const obs=new MutationObserver(()=>{if(profileStatus.textContent.trim()==='Not Verified')profileStatus.textContent='Unverified';});obs.observe(profileStatus,{childList:true,characterData:true,subtree:true});if(profileStatus.textContent.trim()==='Not Verified')profileStatus.textContent='Unverified';}
})();