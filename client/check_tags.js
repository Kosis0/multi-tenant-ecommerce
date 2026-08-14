const fs = require('fs');
const content = fs.readFileSync('c:/Users/kosiu/Desktop/E-commerce/client/app/[tenant]/page.jsx', 'utf8');

let stack = [];
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // A very basic tag counting for block elements.
  // We'll just look for <div, </div>, <motion.div, </motion.div>, <AnimatePresence, </AnimatePresence>
  let divOpens = (line.match(/<div(\s|>)/g) || []).length;
  let divCloses = (line.match(/<\/div>/g) || []).length;
  
  let motionOpens = (line.match(/<motion\.div(\s|>)/g) || []).length;
  let motionCloses = (line.match(/<\/motion\.div>/g) || []).length;
  
  let animateOpens = (line.match(/<AnimatePresence(\s|>)/g) || []).length;
  let animateCloses = (line.match(/<\/AnimatePresence>/g) || []).length;

  for(let j=0; j<divOpens; j++) stack.push({tag: 'div', line: i+1});
  for(let j=0; j<motionOpens; j++) stack.push({tag: 'motion.div', line: i+1});
  for(let j=0; j<animateOpens; j++) stack.push({tag: 'AnimatePresence', line: i+1});
  
  for(let j=0; j<divCloses; j++) {
    if(stack.length && stack[stack.length-1].tag === 'div') stack.pop();
    else console.log(`Unmatched </div> at line ${i+1}`);
  }
  for(let j=0; j<motionCloses; j++) {
    if(stack.length && stack[stack.length-1].tag === 'motion.div') stack.pop();
    else console.log(`Unmatched </motion.div> at line ${i+1}`);
  }
  for(let j=0; j<animateCloses; j++) {
    if(stack.length && stack[stack.length-1].tag === 'AnimatePresence') stack.pop();
    else console.log(`Unmatched </AnimatePresence> at line ${i+1}`);
  }
}

console.log('Remaining in stack:', stack);
