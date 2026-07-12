import fs from 'fs';
import path from 'path';

const CLAUDE_SKILLS_DIR = path.resolve(process.cwd(), '.claude', 'skills');
const AGENTS_SKILLS_DIR = path.resolve(process.cwd(), '.agents', 'skills');

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function migrateSkill(skillName: string) {
  const srcSkillDir = path.join(CLAUDE_SKILLS_DIR, skillName);
  const destSkillDir = path.join(AGENTS_SKILLS_DIR, skillName);
  const destReferencesDir = path.join(destSkillDir, 'references');

  console.log(`Migrating skill: ${skillName}...`);

  fs.mkdirSync(destSkillDir, { recursive: true });
  fs.mkdirSync(destReferencesDir, { recursive: true });

  // 1. Copy directories (agent, rules, skills) to references/
  const subDirs = ['agent', 'rules', 'skills'];
  for (const subDir of subDirs) {
    const srcSubDirPath = path.join(srcSkillDir, subDir);
    if (fs.existsSync(srcSubDirPath)) {
      copyDirSync(srcSubDirPath, path.join(destReferencesDir, subDir));
    }
  }

  // 2. Read and modify SKILL.md
  const srcSkillMdPath = path.join(srcSkillDir, 'SKILL.md');
  if (fs.existsSync(srcSkillMdPath)) {
    let content = fs.readFileSync(srcSkillMdPath, 'utf-8');

    // Replace absolute paths: .claude/skills/<name>/ -> .agents/skills/<name>/references/
    const claudePathRegex = new RegExp(`\\.claude/skills/${skillName}/`, 'g');
    content = content.replace(claudePathRegex, `.agents/skills/${skillName}/references/`);

    // Replace relative paths in step tables: skills/ -> references/skills/
    content = content.replace(/\|\s*skills\//g, '| references/skills/');

    fs.writeFileSync(path.join(destSkillDir, 'SKILL.md'), content, 'utf-8');
  }

  console.log(`Successfully migrated: ${skillName}`);
}

function main() {
  if (!fs.existsSync(CLAUDE_SKILLS_DIR)) {
    console.error(`Source directory not found: ${CLAUDE_SKILLS_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(CLAUDE_SKILLS_DIR, { withFileTypes: true });
  const skillsToMigrate = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  for (const skillName of skillsToMigrate) {
    migrateSkill(skillName);
  }

  console.log('\nAll skills migrated successfully!');
}

main();
