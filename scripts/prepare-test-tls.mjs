import { execFileSync } from 'node:child_process';
import { mkdirSync,chmodSync,readFileSync,writeFileSync } from 'node:fs';
const dir='../private/e2e-tls';mkdirSync(dir,{recursive:true});
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',dir+'/key.pem','-out',dir+'/cert.pem','-days','2','-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1'],{stdio:'ignore'});
chmodSync(dir+'/key.pem',0o600);writeFileSync(dir+'/ca.pem',Buffer.concat([readFileSync('/etc/ssl/certs/ca-certificates.crt'),readFileSync(dir+'/cert.pem')]));
