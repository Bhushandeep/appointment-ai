$imagePath = "C:/Users/91858/.gemini/antigravity/brain/12d1f7c9-776c-42f9-9cf5-09d58d4ea06f/appointment_test_image_1768831324797.png"

# Read the image file
$fileBytes = [System.IO.File]::ReadAllBytes($imagePath)
$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

# Create boundary
$boundary = [System.Guid]::NewGuid().ToString()

# Build the body
$LF = "`r`n"
$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"appointment.png`"",
    "Content-Type: image/png$LF",
    $fileEnc,
    "--$boundary--$LF"
) -join $LF

# Make the request
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/v1/appointment/parse" -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Message
}
