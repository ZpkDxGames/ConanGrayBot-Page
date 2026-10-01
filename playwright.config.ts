import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
export default defineConfig({testDir:'./tests/e2e',workers:1,use:{baseURL:'https://localhost:3000',ignoreHTTPSErrors:true,launchOptions:process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}},webServer:[
 {command:'../.venv/bin/python -m tests.runtime_fixture',cwd:'../core',url:'http://127.0.0.1:8001/health/live',timeout:30000},
 {command:'pnpm start --hostname 127.0.0.1 --port 4000',url:'http://127.0.0.1:4000/login',timeout:30000,env:{APP_ORIGIN:'https://localhost:3000',CORE_ORIGIN:'https://localhost:8000',CORE_SERVICE_TOKEN:'integration-service-'+'a'.repeat(40),SESSION_SECRET:'integration-session-'+'c'.repeat(40),DISCORD_GUILD_ID:'123',DISCORD_CLIENT_ID:'integration-client',DISCORD_CLIENT_SECRET:'integration-oauth-fixture',NODE_EXTRA_CA_CERTS:resolve('../private/e2e-tls/ca.pem')}},
 {command:'node tests/tls-proxy.mjs',url:'https://localhost:3000/login',ignoreHTTPSErrors:true,timeout:30000}
]});
