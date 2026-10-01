export function environment() {
  const get=(key:string)=>{const value=process.env[key];if(!value)throw new Error(`Missing ${key}`);return value;};
  const origin=(key:string)=>{const url=new URL(get(key));if(url.username||url.password||url.pathname!=="/"||url.search||url.hash||(!["https:"].includes(url.protocol)&&!(process.env.NODE_ENV!=="production"&&["localhost","127.0.0.1"].includes(url.hostname))))throw new Error(`Invalid ${key}`);return url.origin;};
  const secret=get("CORE_SERVICE_TOKEN"),sessionSecret=get("SESSION_SECRET");
  if(secret.length<32||sessionSecret.length<32||secret===sessionSecret)throw new Error("Independent secrets must have at least 32 characters");
  const guildId=get("DISCORD_GUILD_ID");if(!/^\d+$/.test(guildId))throw new Error("Invalid guild ID");
  return {appOrigin:origin("APP_ORIGIN"),coreOrigin:origin("CORE_ORIGIN"),secret,sessionSecret,guildId,clientId:get("DISCORD_CLIENT_ID"),clientSecret:get("DISCORD_CLIENT_SECRET")};
}
