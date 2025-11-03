/**
 * Script to copy and customize index.html for all 3 websites
 */

const fs = require('fs');
const path = require('path');

const websites = [
  {
    dir: 'website-1-video',
    title: 'Video Learning Platform',
    icon: '🎥',
    description: 'Nền tảng học tập video - Tích hợp EduWallet',
    gradient: '#667eea, #764ba2'
  },
  {
    dir: 'website-2-quiz',
    title: 'Quiz Learning Platform',
    icon: '📝',
    description: 'Nền tảng học tập trắc nghiệm - Tích hợp EduWallet',
    gradient: '#11998e, #38ef7d'
  },
  {
    dir: 'website-3-hybrid',
    title: 'Hybrid Learning Platform',
    icon: '🎯',
    description: 'Nền tảng học tập kết hợp - Tích hợp EduWallet',
    gradient: '#fc4a1a, #f7b733'
  }
];

// Read the base HTML template from website 1
const templatePath = path.join(__dirname, 'website-1-video', 'public', 'index.html');
let template = fs.readFileSync(templatePath, 'utf8');

websites.forEach((website, index) => {
  console.log(`\n🔄 Creating HTML for ${website.title}...`);
  
  let html = template;
  
  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>Partner Demo - ${website.title}</title>`
  );
  
  // Replace header icon and title
  html = html.replace(
    /<span>🎥<\/span>\s*[\r\n\s]*Video Learning Platform/,
    `<span>${website.icon}</span>\n                ${website.title}`
  );
  
  // Replace header description
  html = html.replace(
    /Nền tảng học tập video - Tích hợp EduWallet/,
    website.description
  );
  
  // Replace gradient colors in CSS
  if (index > 0) {
    html = html.replace(
      /linear-gradient\(135deg, #667eea 0%, #764ba2 100%\)/g,
      `linear-gradient(135deg, ${website.gradient.split(', ')[0]} 0%, ${website.gradient.split(', ')[1]} 100%)`
    );
  }
  
  // Write to website directory
  const outputPath = path.join(__dirname, website.dir, 'public', 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Created: ${outputPath}`);
});

console.log('\n✅ All HTML files created successfully!\n');
