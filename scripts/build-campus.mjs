// Build script for campus-3d assets: minifies JS modules with sourcemaps and inlines minified CSS
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const jsFiles = [
    'src/main/resources/static/vendor/three/three.core.js',
    'src/main/resources/static/vendor/three/three.module.js',
    'src/main/resources/static/vendor/three/addons/controls/OrbitControls.js',
    'src/main/resources/static/vendor/three/addons/libs/meshopt_decoder.module.js',
    'src/main/resources/static/vendor/three/addons/loaders/GLTFLoader.js',
    'src/main/resources/static/vendor/three/addons/utils/BufferGeometryUtils.js',
    'src/main/resources/static/vendor/three/addons/utils/SkeletonUtils.js',
    'src/main/resources/static/js/campus-3d/main.js',
    'src/main/resources/static/js/campus-3d/world-data.js',
    'src/main/resources/static/js/campus-3d/materials-env.js',
    'src/main/resources/static/js/campus-3d/player-controls.js',
    'src/main/resources/static/js/campus-3d/student-avatar.js',
    'src/main/resources/static/js/campus-3d/traffic-system.js',
    'src/main/resources/static/js/campus-3d/pedestrian-system.js',
    'src/main/resources/static/js/campus-3d/traffic-lights.js',
    'src/main/resources/static/js/campus-3d/hud-ui.js',
    'src/main/resources/static/js/campus-3d/airspace-system.js',
    'src/main/resources/static/js/campus-3d/fireworks-system.js'
];

console.log('--- Minifying Campus 3D JavaScript Modules ---');
let totalOriginalJs = 0;
let totalMinifiedJs = 0;

for (const relPath of jsFiles) {
    const absPath = path.resolve(rootDir, relPath);
    if (!fs.existsSync(absPath)) {
        console.warn(`File not found: ${relPath}`);
        continue;
    }
    const originalContent = fs.readFileSync(absPath, 'utf8');
    const originalSize = Buffer.byteLength(originalContent, 'utf8');
    totalOriginalJs += originalSize;

    esbuild.buildSync({
        entryPoints: [absPath],
        outfile: absPath,
        allowOverwrite: true,
        minify: true,
        sourcemap: 'external',
        target: 'es2022'
    });

    const minifiedSize = fs.statSync(absPath).size;
    totalMinifiedJs += minifiedSize;
    console.log(`[JS] ${path.basename(relPath)}: ${(originalSize / 1024).toFixed(1)} KB -> ${(minifiedSize / 1024).toFixed(1)} KB`);
}

console.log(`Total JS size: ${(totalOriginalJs / 1024).toFixed(1)} KB -> ${(totalMinifiedJs / 1024).toFixed(1)} KB (Saved ${((totalOriginalJs - totalMinifiedJs) / 1024).toFixed(1)} KB)`);

// Minify inline CSS in husc-campus.html
const htmlPath = path.resolve(rootDir, 'src/main/resources/templates/husc-campus.html');
if (fs.existsSync(htmlPath)) {
    console.log('--- Minifying inline CSS in husc-campus.html ---');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const styleRegex = /<style>([\s\S]*?)<\/style>/;
    const match = styleRegex.exec(htmlContent);
    if (match) {
        const rawCss = match[1];
        const minifiedCss = esbuild.transformSync(rawCss, { loader: 'css', minify: true }).code;
        const updatedHtml = htmlContent.replace(styleRegex, `<style>${minifiedCss}</style>`);
        fs.writeFileSync(htmlPath, updatedHtml, 'utf8');
        console.log(`[CSS] Inline style: ${(Buffer.byteLength(rawCss, 'utf8') / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(minifiedCss, 'utf8') / 1024).toFixed(1)} KB`);
    }
}

console.log('--- Build completed successfully ---');
