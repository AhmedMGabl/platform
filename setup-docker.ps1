# Unholy Platform - Docker Setup Script
Write-Host "=== Unholy Platform - Docker Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is already installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerInstalled) {
    Write-Host "Docker is already installed!" -ForegroundColor Green
    docker --version
} else {
    Write-Host "Docker is not installed. Please install Docker Desktop:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host "2. Run the installer" -ForegroundColor White
    Write-Host "3. Restart your computer" -ForegroundColor White
    Write-Host "4. Start Docker Desktop" -ForegroundColor White
    Write-Host "5. Come back and run this script again" -ForegroundColor White
    Write-Host ""

    # Offer to open the download page
    $response = Read-Host "Open Docker Desktop download page? (y/n)"
    if ($response -eq "y") {
        Start-Process "https://www.docker.com/products/docker-desktop/"
    }

    Write-Host ""
    Write-Host "After Docker is installed, run this script again to start the services." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Checking Docker status..." -ForegroundColor Cyan

# Check if Docker daemon is running
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is installed but not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and wait for it to be ready, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is running!" -ForegroundColor Green
Write-Host ""

# Navigate to dev directory
Write-Host "Starting Unholy backend services..." -ForegroundColor Cyan
Set-Location "W:\WS\AhmedGabl\unholy\dev"

# Start services
Write-Host "Running: docker-compose up -d" -ForegroundColor White
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Backend services started successfully! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services running:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "You can now sign in to your Electron app!" -ForegroundColor Green
    Write-Host "Default credentials will be created on first access." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Failed to start services. Check the error above." -ForegroundColor Red
    exit 1
}
