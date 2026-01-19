# Appointment AI - API Test Script (Windows PowerShell)
# Make sure your server is running: npm run dev

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Appointment AI - API Tests" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET | ConvertTo-Json
Write-Host "`n"

# Test 2: Text Input - Dentist Appointment
Write-Host "Test 2: Dentist Appointment (Text)" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" -Method POST -ContentType "application/json" -Body '{"text": "Book dentist appointment tomorrow at 3pm"}' | ConvertTo-Json -Depth 10
Write-Host "`n"

# Test 3: Text Input - Cardiology
Write-Host "Test 3: Cardiology Appointment (Text)" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" -Method POST -ContentType "application/json" -Body '{"text": "Cardiology next Monday at 10:30am"}' | ConvertTo-Json -Depth 10
Write-Host "`n"

# Test 4: Ambiguous Time
Write-Host "Test 4: Ambiguous Time - Should Ask for Clarification" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" -Method POST -ContentType "application/json" -Body '{"text": "Eye doctor tomorrow morning"}' | ConvertTo-Json -Depth 10
Write-Host "`n"

# Test 5: Missing Department
Write-Host "Test 5: Missing Department - Should Ask for Clarification" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" -Method POST -ContentType "application/json" -Body '{"text": "Appointment tomorrow at 3pm"}' | ConvertTo-Json -Depth 10
Write-Host "`n"

# Test 6: Image Upload
Write-Host "Test 6: Image Upload (OCR)" -ForegroundColor Yellow
Write-Host "--------------------------" -ForegroundColor Yellow
if (Test-Path "test-appointment.png") {
    node test-image.js
} else {
    Write-Host "Image file 'test-appointment.png' not found. Skipping image test." -ForegroundColor Red
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
