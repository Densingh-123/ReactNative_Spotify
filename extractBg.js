const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'react spotify', 'src', 'components', 'AnimatedBackground.tsx');
const destPath = path.join(__dirname, 'src', 'components', 'AnimatedBackground.tsx');

let content = fs.readFileSync(srcPath, 'utf8');

// Extract initParticles body
const initStart = content.indexOf('const initParticles = (mode: ThemeMode, width: number, height: number) => {');
const initHeader = 'const initParticles = (mode: ThemeMode, width: number, height: number) => {';
let braceCount = 1;
let initEnd = initStart + initHeader.length;
while (braceCount > 0 && initEnd < content.length) {
    if (content[initEnd] === '{') braceCount++;
    if (content[initEnd] === '}') braceCount--;
    initEnd++;
}
let initBody = content.substring(initStart + initHeader.length, initEnd - 1)
    .replace(/particles\.current/g, 'particles')
    .replace(/currentMode/g, 'mode'); // In case currentMode was used directly

// Extract draw body
const drawStart = content.indexOf('const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {');
const drawHeader = 'const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {';
braceCount = 1;
let drawEnd = drawStart + drawHeader.length;
while (braceCount > 0 && drawEnd < content.length) {
    if (content[drawEnd] === '{') braceCount++;
    if (content[drawEnd] === '}') braceCount--;
    drawEnd++;
}
let drawBody = content.substring(drawStart + drawHeader.length, drawEnd - 1)
    .replace(/particles\.current/g, 'particles')
    .replace(/timeRef\.current/g, 'timeRef')
    .replace(/requestRef\.current/g, 'requestRef')
    .replace(/currentMode/g, 'currentMode');

const rnComponent = `import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';

export default function AnimatedBackground() {
  const { currentMode, colors } = useTheme();
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(\`
        window.postMessageData({
          type: 'UPDATE_THEME',
          mode: '\${currentMode}',
          colors: \${JSON.stringify(colors)}
        });
        true;
      \`);
    }
  }, [currentMode, colors]);

  const htmlContent = \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: transparent; }
        canvas { width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; pointer-events: none; z-index: 0; }
      </style>
    </head>
    <body style="background-color: \${colors.bg};">
      <canvas id="bg-canvas"></canvas>
      <script>
        let currentMode = '\${currentMode}';
        let colors = \${JSON.stringify(colors)};
        let particles = [];
        let requestRef = null;
        let timeRef = 0;

        window.postMessageData = function(data) {
           if (data.type === 'UPDATE_THEME') {
              currentMode = data.mode;
              colors = data.colors;
              document.body.style.backgroundColor = colors.bg;
              handleResize();
           }
        };

        // For iOS webview message
        document.addEventListener("message", function(event) {
          try { window.postMessageData(JSON.parse(event.data)); } catch(e) {}
        });
        // For Android webview message
        window.addEventListener("message", function(event) {
          try { window.postMessageData(JSON.parse(event.data)); } catch(e) {}
        });

        function initParticles(mode, width, height) {
          \${initBody}
        }

        function draw(ctx, width, height) {
          \${drawBody}
        }

        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');

        function handleResize() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          initParticles(currentMode, canvas.width, canvas.height);
        }

        window.addEventListener('resize', handleResize);
        handleResize();
        
        function animate() {
           draw(ctx, canvas.width, canvas.height);
           requestRef = requestAnimationFrame(animate);
        }
        animate();
      </script>
    </body>
    </html>
  \`;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1, backgroundColor: colors.bg }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        pointerEvents="none"
      />
    </View>
  );
}
`;

fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.writeFileSync(destPath, rnComponent);
console.log("AnimatedBackground component successfully generated for React Native.");
