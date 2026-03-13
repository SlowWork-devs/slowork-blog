#!/usr/bin/env node
/**
 * Script para migrar posts desde posts.js a archivos Markdown individuales
 * para Astro Content Collections.
 * 
 * Uso: node scripts/migrate-posts-to-md.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/**
 * Resuelve la ruta del import (relativa a posts.js) a ruta relativa desde el .md
 * posts.js está en content/blog/es/ → ../../ sube a content/
 * .md está en content/blog/es/ → ../../../ sube a src/ para llegar a assets
 */
function resolveImagePath(importPath) {
  // ../../assets/blog_assets/X.png -> ../../../assets/blog_assets/X.png
  return importPath.replace(/^\.\.\/\.\.\//, '../../../');
}

/**
 * Extrae imports de imágenes del archivo y construye el mapeo variable -> ruta
 */
function extractImageMap(fileContent) {
  const map = {};
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    const [, varName, importPath] = match;
    map[varName] = resolveImagePath(importPath);
  }
  return map;
}

/**
 * Reemplaza ${VariableName} en el contenido por la ruta de imagen
 */
function resolveImageRefs(content, imageMap) {
  return content.replace(/\$\{(\w+)\}/g, (_, varName) => {
    return imageMap[varName] ?? '';
  });
}

/**
 * Genera slug desde el título para el nombre del archivo
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

/**
 * Escapa strings para YAML (siempre entre comillas para evitar problemas con :, #, etc.)
 */
function escapeYamlString(str) {
  if (str == null) return '""';
  const s = String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
  return `"${s}"`;
}

/**
 * Procesa un archivo posts.js y genera los .md
 */
function processPostsFile(lang, filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imageMap = extractImageMap(content);

  // Eliminar imports y extraer el array posts
  const withoutImports = content.replace(/import\s+\w+\s+from\s+[^;]+;[\s\n]*/g, '');
  const arrayMatch = withoutImports.match(/const\s+posts\s*=\s*(\[[\s\S]*\])\s*;?\s*$/m);
  if (!arrayMatch) {
    throw new Error(`No se encontró el array posts en ${filePath}`);
  }

  let arrayStr = arrayMatch[1];
  // Resolver referencias ${Var} en todo el array
  arrayStr = resolveImageRefs(arrayStr, imageMap);

  // Evaluar el array
  const posts = eval(arrayStr);

  const outputDir = join(ROOT, 'src', 'content', 'blog', lang);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const created = [];
  for (const post of posts) {
    const slug = slugify(post.title);
    const filename = `${post.id}-${slug}.md`;
    const frontmatter = {
      id: post.id,
      title: post.title,
      date: post.date,
      time: post.time,
      image: post.image,
      excerpt: post.excerpt,
      keywords: post.keywords,
      language: lang,
    };

    const frontmatterYaml = `---
id: ${frontmatter.id}
title: ${escapeYamlString(frontmatter.title)}
date: ${frontmatter.date}
time: ${escapeYamlString(String(frontmatter.time || ''))}
image: ${escapeYamlString(String(frontmatter.image || ''))}
excerpt: ${escapeYamlString(frontmatter.excerpt)}
keywords: ${escapeYamlString(frontmatter.keywords)}
language: "${lang}"
---

`;

    const body = (post.content || '').trim();
    const fullContent = frontmatterYaml + body;

    const outputPath = join(outputDir, filename);
    writeFileSync(outputPath, fullContent, 'utf-8');
    created.push(filename);
  }

  return created;
}

// Ejecutar migración
console.log('Iniciando migración de posts a Markdown...\n');

const esPath = join(ROOT, 'src', 'content', 'blog', 'es', 'posts.js');
const enPath = join(ROOT, 'src', 'content', 'blog', 'en', 'posts.js');

let totalCreated = 0;

try {
  const esFiles = processPostsFile('es', esPath);
  console.log(`[ES] Creados ${esFiles.length} archivos:`);
  esFiles.forEach((f) => console.log(`  - ${f}`));
  totalCreated += esFiles.length;

  const enFiles = processPostsFile('en', enPath);
  console.log(`\n[EN] Creados ${enFiles.length} archivos:`);
  enFiles.forEach((f) => console.log(`  - ${f}`));
  totalCreated += enFiles.length;

  console.log(`\n✓ Migración completada: ${totalCreated} archivos .md generados.`);
  console.log('Los archivos posts.js pueden ser archivados tras verificar que todo funciona.');
} catch (err) {
  console.error('Error durante la migración:', err);
  process.exit(1);
}
