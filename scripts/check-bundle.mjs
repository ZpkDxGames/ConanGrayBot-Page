import { readdirSync,statSync,readFileSync } from 'node:fs';import { join } from 'node:path';import { gzipSync } from 'node:zlib';
function files(dir){return readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?files(path):path.endsWith('.js')?[path]:[];});}
const total=files('.next/static').reduce((sum,path)=>sum+gzipSync(readFileSync(path)).length,0);if(total>750000)throw new Error('Compressed JavaScript exceeds 750000-byte whole-build budget');console.log('Compressed JavaScript:',total,'bytes');
