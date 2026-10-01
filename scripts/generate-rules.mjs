import { readFileSync,writeFileSync } from 'node:fs';
const api=JSON.parse(readFileSync('contracts/openapi.json','utf8')),schemas=api.components.schemas,rules={};
function resolve(node){return node.$ref?schemas[node.$ref.split('/').at(-1)]:node;}
function walk(node,path){node=resolve(node);const rule={};for(const key of ['enum','minimum','maximum','minLength','maxLength'])if(node[key]!==undefined)rule[key]=node[key];if(node.type==='array'){const item=resolve(node.items);if(item.type==='object')rule.arrayObjects=true;walk(item,[...path,'*']);}for(const [key,value] of Object.entries(node.properties||{}))walk(value,[...path,key]);if(Object.keys(rule).length)rules[path.join('.')]=rule;}
walk(schemas.BotConfig,[]);writeFileSync('src/lib/field-rules.json',JSON.stringify(rules,null,2)+'\n');
