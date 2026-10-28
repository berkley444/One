const puppeteer=require('puppeteer-core'); const fs=require('fs');
(async()=>{
  const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
  const D='/workspace/One_repo/icons/';
  const jobs=[['icon.svg',192,'icon-192.png'],['icon.svg',512,'icon-512.png'],['icon-maskable.svg',512,'icon-maskable-512.png'],['icon-maskable.svg',180,'apple-touch-icon.png']];
  for(const [src,size,out] of jobs){
    const p=await b.newPage(); await p.setViewport({width:size,height:size,deviceScaleFactor:1});
    const svg=fs.readFileSync(D+src,'utf8');
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ',`<svg width="${size}" height="${size}" `)}</body></html>`);
    await p.screenshot({path:D+out,omitBackground:true,clip:{x:0,y:0,width:size,height:size}}); await p.close();
  }
  await b.close();
})();
