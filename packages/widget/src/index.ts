export type EduMindWidgetOptions = {
  supabaseUrl: string;
  anonKey: string;
  theme?: 'light' | 'dark';
  position?: 'right' | 'left';
  title?: string;
};

export function mountEduMindWidget(options: EduMindWidgetOptions) {
  const posRight = options.position !== 'left';
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.zIndex = '999999';
  container.style.bottom = '24px';
  container.style[posRight ? 'right' : 'left'] = '24px';
  container.style.width = '360px';
  container.style.height = '560px';
  container.style.border = 'none';
  container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
  container.style.borderRadius = '16px';
  container.style.overflow = 'hidden';

  const iframe = document.createElement('iframe');
  iframe.srcdoc = `<!doctype html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>EduMind Widget</title><style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto} .header{padding:10px;background:${options.theme==='dark'?'#0b0b0e':'#6C5CE7'};color:#fff;font-weight:700} .container{height:calc(100vh - 44px);display:flex;flex-direction:column} .messages{flex:1;overflow:auto;padding:12px;background:${options.theme==='dark'?'#0b0b0e':'#fafafa'};color:${options.theme==='dark'?'#fafafa':'#111'}} .input{display:flex;gap:8px;padding:8px;border-top:1px solid #e5e7eb;background:${options.theme==='dark'?'#111':'#fff'}}</style></head><body><div class='header'>${options.title ?? 'EduMind AI'}</div><div class='container'><div id='messages' class='messages'></div><div class='input'><input id='text' placeholder='Ask a question…' style='flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:${options.theme==='dark'?'#111':'#fff'};color:inherit'/><button id='send' style='padding:10px 14px;border-radius:8px;border:none;background:#6C5CE7;color:#fff'>Send</button></div></div><script>const messages=document.getElementById('messages');const input=document.getElementById('text');const send=document.getElementById('send');function append(role, text){const d=document.createElement('div');d.style.margin='8px 0';d.innerHTML='<div style=\'font-size:12px;opacity:.6\'>'+role+'</div><div>'+text.replace(/</g,'&lt;')+'</div>';messages.appendChild(d);messages.scrollTop=messages.scrollHeight;}send.addEventListener('click',async()=>{const t=input.value.trim();if(!t) return;input.value='';append('you',t);const r=await fetch('https://'+location.host+'/functions/v1/ai-chat',{method:'POST',headers:{'Content-Type':'application/json','apikey':'${options.anonKey}','Authorization':'Bearer ${options.anonKey}'},body:JSON.stringify({mode:'summary',messages:[{role:'user',message:t}]})});const j=await r.json();append('edumind',j.reply||'No reply');});</script></body></html>`;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  container.appendChild(iframe);
  document.body.appendChild(container);

  return {
    unmount() { container.remove(); }
  };
}