var a,b,d,e,f,g,h,k,l,m,n,p,q,t,u,v,w;e=f=g=p=n=0;q=new Uint32Array(4E5);q.fill(0xc001000);t=[0x3e8bcb,0x3483cb,193,0xc99c08f,0x47834f,0x516848d,0x3918c06d,0x39f3839b,0x7fb18f,0x51e8477,473,0xc001000,0x130381c1,0x37cd83c1,0x169801f3,0x9db,599,0x403683c1,0x13d800b3,0x6000ab,0x5000ab,0x34d381cb,0x68880ef,0x39f38057];u={};for(h in"ba87a7777df0733f30ff744407fd00aaa0007ff730090975070090f0f0ffff0a0ffa7105")u[t[h/3|0]]|=("0x"+"ba87a7777df0733f30ff744407fd00aaa0007ff730090975070090f0f0ffff0a0ffa7105"[h]+"ba87a7777df0733f30ff744407fd00aaa0007ff730090975070090f0f0ffff0a0ffa7105"[h]|0)<<h%3*8;m=new ArrayBuffer(16E5);w=new Uint32Array(m);v=new Uint8ClampedArray(m);onmousedown=r=>e=1;onmouseup=r=>e=0;onmousemove=r=>{f=r.offsetX;g=r.offsetY};onwheel=r=>n+=0<r.deltaY||11;setInterval(r=>{w.fill(0xff000000);for(y=4;-4<y--;)for(x=4;-4<x--;)for(e&&(q[f+800*g+x+800*y]=t[n%12]^p),h=12;h--;)w[16+16*h+x+800*y+0xc80*(h==n%12)+0xc80]|=u[t[h]];p^=1;for(b=4E5;b--;)a=q[b],a^0xc001000&&(1&a)==p&&(k=a&0x3800000&&128<<(a>>23&7),l=a&0x70000&&128<<(a>>16&7),w[b]|=u[a|1],a&32&&.1>Math.random()&&(a=t[(a>>19&15)+8]^p),a&0x8000&&(a&0x40000000?(d=b-800,q[d]&l&&(a=t[(a>>19&15)+8]^p),q[d]&k&&(q[d]=t[(a>>26&15)+8]^p)):(d=b+[1,-1,800,-800][4*Math.random()|0],q[d]&l&&(a=t[(a>>19&15)+8]^p),q[d]&k&&(q[d]=t[(a>>26&15)+8]^p),l=a&0x70000&&128<<(a>>16&7),d=b+[1,-1,800,-800][4*Math.random()|0],q[d]&l&&(a=t[(a>>19&15)+8]^p),q[d]&k&&(q[d]=t[(a>>26&15)+8]^p))),d=b+((Math.random()-.5)*(1+(a&6))|0)+800*((a&8&&1)-(a&16&&.5<Math.random())),4E5>d&&0<d&&(q[d]&192)<(a&192)||a&4&&(q[d=b+((Math.random()-.5)*(1+(a&6))|0)]&192)<(a&192)||(d=b),a&0x8000||(q[d]&l&&(a=t[(a>>19&15)+8]^p),q[d]&k&&(q[d]=t[(a>>26&15)+8]^p)),q[b]=q[d],q[d]=a^1);c.putImageData(new ImageData(v,800,500),0,0)},16);