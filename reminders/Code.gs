/** Ramsgate reminders. Reads only the already-public utility Sheet.
 * Does not send messages or change the Sheet. Phone contacts stay on the iPhone.
 */
const RAMSGATE_SHEET_ID = '11hf12fRWlNTAq9Z96ln1Z1SedxDRXab-RjD74mT3Ouk';
const RAMSGATE_MOVE_IN = Date.UTC(2026, 7, 17);
function doGet() {
  try {
    const payload = buildRamsgateReminders(readRamsgateBills());
    return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error.message);
    return ContentService.createTextOutput(JSON.stringify({status:'error',Jason:{send:'no'},Alex:{send:'no'}})).setMimeType(ContentService.MimeType.JSON);
  }
}
function readRamsgateBills() {
  const keys = ['Rent','Electric','Gas','Wifi'];
  const responses = UrlFetchApp.fetchAll(keys.map(key => ({url:'https://docs.google.com/spreadsheets/d/'+RAMSGATE_SHEET_ID+'/gviz/tq?headers=1&range=A1:G1000&tqx=out:json&sheet='+key+'&fresh='+Date.now(),muteHttpExceptions:true})));
  const bills=[];
  responses.forEach((response,index) => {
    if(response.getResponseCode()!==200)throw new Error('Sheet unavailable');
    const text=response.getContentText(),start=text.indexOf('({'),end=text.lastIndexOf(');');
    if(start<0||end<0)throw new Error('Unexpected Sheet response');
    const result=JSON.parse(text.slice(start+1,end));
    if(result.status!=='ok'||!result.table)throw new Error('Sheet read failed');
    const key=keys[index],columns=result.table.cols.map(c=>c.label);
    const amountIndex=columns.indexOf(key==='Rent'?'Total Rent':'Total Bill');
    if(amountIndex<0||columns.indexOf('Start Date')<0||columns.indexOf('End Date')<0||['Jason','Alex'].some(n=>columns.indexOf(n+' Paid')<0))throw new Error('Missing required columns');
    result.table.rows.forEach(row=>{
      const value=i=>row.c[i]&&row.c[i].v;
      const amount=value(amountIndex),startDate=value(columns.indexOf('Start Date'));
      if(!startDate||amount==null)return;
      if(typeof amount!=='number'||!Number.isFinite(amount)||amount<0)throw new Error('Invalid bill amount');
      bills.push({key,start:parseRamsgateDate(startDate),end:parseRamsgateDate(value(columns.indexOf('End Date'))),amount,paid:{Jason:String(value(columns.indexOf('Jason Paid'))||'').trim().toLowerCase(),Alex:String(value(columns.indexOf('Alex Paid'))||'').trim().toLowerCase()}});
    });
  });
  return bills;
}
function parseRamsgateDate(value) {
  const match=String(value||'').match(/^Date\((\d+),(\d+),(\d+)/);
  if(!match)throw new Error('Missing or invalid billing date');
  return Date.UTC(Number(match[1]),Number(match[2]),Number(match[3]));
}
function ramsgateShare(bill,name) {
  if(bill.key==='Rent')return bill.start<RAMSGATE_MOVE_IN?(name==='Alex'?0:bill.amount/2):bill.amount/3;
  if(bill.start>=RAMSGATE_MOVE_IN)return bill.amount/3;
  const duration=bill.end-bill.start;
  if(duration<=0)throw new Error('Invalid billing period');
  const before=Math.min(duration,Math.max(0,RAMSGATE_MOVE_IN-bill.start));
  const alex=bill.amount*(duration-before)/duration/3;
  return name==='Alex'?alex:(bill.amount-alex)/2;
}
function buildRamsgateReminders(bills) {
  const money=amount=>'$'+amount.toFixed(2);
  const result={status:'ok',checkedAt:new Date().toISOString()};
  ['Jason','Alex'].forEach(name=>{
    // Only explicit "no" statuses qualify. Unknowns and pending amounts never trigger texts.
    const items=bills.filter(b=>b.paid[name]==='no').map(b=>({bill:b,share:ramsgateShare(b,name)})).filter(i=>i.share>=0.005);
    const total=items.reduce((sum,item)=>sum+item.share,0);
    const lines=items.map(({bill,share})=>{
      const date=new Date(bill.start),month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getUTCMonth()];
      return (bill.key==='Wifi'?'WiFi':bill.key)+' ('+month+' '+date.getUTCDate()+', '+date.getUTCFullYear()+'): '+money(share);
    });
    result[name]={send:items.length?'yes':'no',total:Number(total.toFixed(2)),message:items.length?'Hey '+name+', a Ramsgate utilities reminder:\n'+lines.join('\n')+'\nTotal owed: '+money(total)+'\nhttps://camdenguay12.github.io/ramsgate-utilities/':''};
  });
  return result;
}
