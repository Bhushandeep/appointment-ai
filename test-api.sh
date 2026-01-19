#!/bin/bash
# Appointment AI - cURL Test Script
# Make sure your server is running: npm run dev

echo "================================"
echo "Appointment AI - API Tests"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
curl -X GET http://localhost:3000/health
echo -e "\n\n"

# Test 2: Text Input - Dentist Appointment
echo "Test 2: Dentist Appointment (Text)"
echo "-----------------------------------"
curl -X POST http://localhost:3000/v1/appointment/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Book dentist appointment tomorrow at 3pm"}'
echo -e "\n\n"

# Test 3: Text Input - Cardiology
echo "Test 3: Cardiology Appointment (Text)"
echo "--------------------------------------"
curl -X POST http://localhost:3000/v1/appointment/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Cardiology next Monday at 10:30am"}'
echo -e "\n\n"

# Test 4: Ambiguous Time (Should request clarification)
echo "Test 4: Ambiguous Time - Should Ask for Clarification"
echo "-------------------------------------------------------"
curl -X POST http://localhost:3000/v1/appointment/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Eye doctor tomorrow morning"}'
echo -e "\n\n"

# Test 5: Missing Department
echo "Test 5: Missing Department - Should Ask for Clarification"
echo "----------------------------------------------------------"
curl -X POST http://localhost:3000/v1/appointment/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "Appointment tomorrow at 3pm"}'
echo -e "\n\n"

# Test 6: Image Upload
echo "Test 6: Image Upload (OCR)"
echo "--------------------------"
if [ -f "test-appointment.png" ]; then
  curl -X POST http://localhost:3000/v1/appointment/parse \
    -F "image=@test-appointment.png"
  echo -e "\n"
else
  echo "Image file 'test-appointment.png' not found. Skipping image test."
fi

echo ""
echo "================================"
echo "All tests completed!"
echo "================================"
