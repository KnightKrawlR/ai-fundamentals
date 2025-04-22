@echo off
echo Building My Game Plan application...

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Run webpack to build the bundle
echo Running webpack...
npx webpack --config webpack.config.js --mode production

echo Build completed!
echo Game plan bundle created at: ..\dist\my-game-plan-bundle.js 