# Huly Electron Desktop Launcher
Write-Host "Starting Huly Desktop..." -ForegroundColor Green

# Set environment variables
$env:MODEL_VERSION = "0.7.0"
$env:VERSION = "0.7.208"
$env:NODE_ENV = "development"
$env:FRONT_URL = "http://localhost:8080"

# Change to desktop directory
Set-Location desktop

# Run Electron
Write-Host "Launching Electron app..." -ForegroundColor Green
Start-Process -FilePath "node_modules\.bin\electron.cmd" -ArgumentList "--no-sandbox", "." -NoNewWindow
