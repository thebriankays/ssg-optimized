#!/usr/bin/env node

/**
 * Verification script to check if all ScrollScene/ViewportScrollScene components
 * are properly wrapped with UseCanvas
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const issues = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(srcDir, filePath);
  
  // Check for ScrollScene/ViewportScrollScene without UseCanvas
  const hasScrollScene = content.includes('ScrollScene') || content.includes('ViewportScrollScene');
  const hasUseCanvas = content.includes('UseCanvas') || content.includes('useCanvas');
  
  if (hasScrollScene && !hasUseCanvas) {
    // More detailed check - look for the actual usage
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if ((line.includes('<ScrollScene') || line.includes('<ViewportScrollScene')) && 
          !line.includes('//') && !line.includes('*')) {
        // Found a usage - now check if UseCanvas is nearby (within 10 lines before)
        let hasNearbyUseCanvas = false;
        for (let i = Math.max(0, index - 10); i < index; i++) {
          if (lines[i].includes('<UseCanvas')) {
            hasNearbyUseCanvas = true;
            break;
          }
        }
        
        if (!hasNearbyUseCanvas) {
          issues.push({
            file: fileName,
            line: index + 1,
            issue: `${line.includes('ViewportScrollScene') ? 'ViewportScrollScene' : 'ScrollScene'} without UseCanvas wrapper`
          });
        }
      }
    });
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      checkFile(filePath);
    }
  });
}

console.log('🔍 Checking for ScrollScene/ViewportScrollScene components without UseCanvas...\n');
walkDir(srcDir);

if (issues.length === 0) {
  console.log('✅ All ScrollScene/ViewportScrollScene components are properly wrapped with UseCanvas!');
} else {
  console.log(`❌ Found ${issues.length} issue(s):\n`);
  issues.forEach(issue => {
    console.log(`  📄 ${issue.file}:${issue.line}`);
    console.log(`     Issue: ${issue.issue}\n`);
  });
  
  console.log('\n💡 To fix these issues:');
  console.log('   1. Import UseCanvas: import { UseCanvas } from "@14islands/r3f-scroll-rig"');
  console.log('   2. Wrap the ScrollScene/ViewportScrollScene with <UseCanvas>');
  console.log('   3. Keep DOM elements OUTSIDE the UseCanvas wrapper\n');
}
