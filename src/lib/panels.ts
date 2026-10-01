import defaults from "../../contracts/defaults.json";
export function panel(slug:string):{section:string;keys?:string[]}|null {
  if(slug==="setup")return {section:"ai",keys:["enabled","channelId","replyMode","providerOrder"]};
  if(slug.startsWith("ai/")){const part=slug.split("/")[1];if(part==="messages")return {section:"messageTemplates"};if(part==="providers")return {section:"ai",keys:["providerOrder","models","maxOutputTokens","temperature"]};if(part==="memory")return {section:"ai",keys:["sharedChannelMemory","maxHistoryMessages","memoryRetentionDays","maxPromptCharacters","mentionStartsNewBranch","replyContinuesBranch","resetKeyword","resetKeywordAdminOnly"]};if(part==="personality")return {section:"ai",keys:["personality","personaPreset","structureInstructions","naturalnessLevel","mirroringLevel","questionFrequency","initiativeLevel","humorLevel","sarcasmLevel","emotionalOpenness","dramaticFlair","teasingLevel","slangLevel","lowEnergyStyle","comfortStyle","unknownStyle","affectionStyle","recurringBits","avoidPhrases","styleExamples"]};if(part==="behavior")return {section:"ai"};}
  if(slug==="media/intake"||slug==="media/drive")return {section:"media"};
  if(slug==="triggers"||slug==="commands"||slug==="weather"||slug==="games")return {section:slug};
  if(slug.startsWith("games/")){const prefix:Record<string,string>={"tictactoe":"ticTacToe","coinflip":"coinflip","eightball":"eightball","rps":"rps","guesssong":"guessSong","wouldyourather":"wouldYouRather"};const name=prefix[slug.split("/")[1]];return name?{section:"games",keys:Object.keys(defaults.games).filter(key=>key.startsWith(name)||["allowedCategoryId","maxActiveGamesPerChannel"].includes(key))}:null;}
  if(slug==="admin/permissions")return {section:"admin"};
  if(slug==="admin/presence")return {section:"presence"};
  if(slug==="settings")return {section:"appearance"};
  return null;
}
