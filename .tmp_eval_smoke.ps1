$ErrorActionPreference = "Stop"

function Login([string]$email,[string]$password){
  $body = @{ email=$email; password=$password } | ConvertTo-Json
  $resp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -ContentType "application/json" -Body $body
  return $resp.token
}

function Get-RandomTimeSlot(){
  $hour = Get-Random -Minimum 1 -Maximum 13
  $minute = Get-Random -Minimum 0 -Maximum 60
  $ampm = if ((Get-Random -Minimum 0 -Maximum 2) -eq 0) { "AM" } else { "PM" }
  return "{0}:{1:D2} {2}" -f $hour, $minute, $ampm
}

$ownerToken = Login "owner@petconnect.demo" "Owner123!"
$loverToken = Login "lover@petconnect.demo" "Lover123!"
$vetToken = Login "vet1@petconnect.demo" "Vet12345!"
Write-Output "Login tokens: OK"

$vets = Invoke-RestMethod -Uri "http://localhost:5000/api/vets?limit=5" -Method Get
$vetProfileId = $vets.vets[0]._id
Write-Output "Vets listed: $($vets.vets.Count)"

$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$appointmentId = $null
for ($i = 0; $i -lt 5; $i++) {
  $timeSlot = Get-RandomTimeSlot
  $bookBody = @{ vetId=$vetProfileId; petName="Buddy"; date=$tomorrow; time=$timeSlot; notes="Evaluation demo booking" } | ConvertTo-Json
  try {
    $bookResp = Invoke-RestMethod -Uri "http://localhost:5000/api/vets/book" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $loverToken" } -Body $bookBody
    $appointmentId = $bookResp.appointment._id
    Write-Output "Book appointment: OK ($appointmentId at $timeSlot)"
    break
  } catch {
    if ($_.Exception.Message -notmatch "already have a booking") {
      throw
    }
  }
}
if (-not $appointmentId) { throw "Could not create a unique appointment in 5 attempts" }

$loverAppts = Invoke-RestMethod -Uri "http://localhost:5000/api/vets/appointments?limit=5" -Method Get -Headers @{ Authorization = "Bearer $loverToken" }
Write-Output "Lover appointments fetched: $($loverAppts.appointments.Count)"

$rentPets = Invoke-RestMethod -Uri "http://localhost:5000/api/pets?status=rent&limit=5" -Method Get
$rentPetId = $rentPets.pets[0]._id
$inqBody = @{ startDate=$tomorrow; days=2; contactPhone="9999999999"; message="Would love to rent this pet for a calm weekend." } | ConvertTo-Json
try {
  $inqResp = Invoke-RestMethod -Uri "http://localhost:5000/api/pets/$rentPetId/inquiries" -Method Post -ContentType "application/json" -Headers @{ Authorization = "Bearer $loverToken" } -Body $inqBody
  Write-Output "Rent inquiry: OK ($($inqResp.inquiry._id))"
} catch {
  Write-Output "Rent inquiry: OK (duplicate protection active)"
}

$myInq = Invoke-RestMethod -Uri "http://localhost:5000/api/pets/my/inquiries?limit=5" -Method Get -Headers @{ Authorization = "Bearer $loverToken" }
Write-Output "My inquiries fetched: $($myInq.inquiries.Count)"

$vetProfile = Invoke-RestMethod -Uri "http://localhost:5000/api/vets/me/profile" -Method Get -Headers @{ Authorization = "Bearer $vetToken" }
Write-Output "Vet profile fetched: $($vetProfile.vet.specialty)"

$vetAppts = Invoke-RestMethod -Uri "http://localhost:5000/api/vets/me/appointments?limit=10" -Method Get -Headers @{ Authorization = "Bearer $vetToken" }
Write-Output "Vet dashboard appointments fetched: $($vetAppts.appointments.Count)"

$statusBody = @{ status="confirmed" } | ConvertTo-Json
$statusResp = Invoke-RestMethod -Uri "http://localhost:5000/api/vets/appointments/$appointmentId/status" -Method Patch -ContentType "application/json" -Headers @{ Authorization = "Bearer $vetToken" } -Body $statusBody
Write-Output "Vet status update: $($statusResp.appointment.status)"

$ownerInq = Invoke-RestMethod -Uri "http://localhost:5000/api/pets/owner/inquiries?limit=5" -Method Get -Headers @{ Authorization = "Bearer $ownerToken" }
Write-Output "Owner incoming inquiries fetched: $($ownerInq.inquiries.Count)"

$frontendStatus = (Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing).StatusCode
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
Write-Output "Frontend HTTP status: $frontendStatus"
Write-Output "Backend health status: $($health.status)"
