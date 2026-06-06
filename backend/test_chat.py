import subprocess, time, urllib.request, json

proc = subprocess.Popen(['python', '-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'],
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5)

base = 'http://localhost:8000'

def req(method, path, data=None):
    url = f'{base}{path}'
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method=method)
    return json.loads(urllib.request.urlopen(r).read())

def chat(msg, pid=None, phone=None):
    d = {'message': msg}
    if pid: d['patient_id'] = pid
    if phone: d['phone'] = phone
    return req('POST', '/ai/chat', d)

print("=== Test 1: Symptom -> suggests booking ===")
r1 = chat('I have fever and headache for 2 days')
print(f'  Intent: {r1["intent"]}')
assert r1['intent'] == 'book_appointment', f'Expected book_appointment, got {r1["intent"]}'
print('  PASS')

print("\n=== Test 2: Name+Phone -> creates patient ===")
r2 = chat('my name is Kainat haq my phone no is 03701077021 and symptom is fever and headache')
print(f'  Intent: {r2["intent"]}')
print(f'  PatientID: {r2["action_data"]["patient_id"]}')
assert r2['intent'] == 'provide_info'
assert r2['action_data']['patient_id'] > 0
pid = r2['action_data']['patient_id']
print('  PASS')

print("\n=== Test 3: Date -> books appointment ===")
r3 = chat('tomorrow at 10am', pid=pid)
print(f'  Intent: {r3["intent"]}')
print(f'  Reply: {r3["reply"][:100]}')
print(f'  Action: {r3["action_data"]["action"]}')
assert r3['action_data']['action'] == 'appointment_confirmed', f'Expected confirmed, got {r3["action_data"]["action"]}'
apt_id = r3['action_data']['appointment_id']
print('  PASS')

print("\n=== Test 4: Messages saved ===")
msgs = req('GET', f'/ai/messages?patient_id={pid}')
print(f'  Total messages for patient: {len(msgs)}')
assert len(msgs) >= 3, f'Expected >=3 messages, got {len(msgs)}'
roles = [m['role'] for m in msgs]
print(f'  Roles: {roles}')
assert 'user' in roles and 'assistant' in roles
print('  PASS')

print("\n=== Test 5: Check appointment status ===")
r5 = chat('check my appointment status', pid=pid)
print(f'  Reply: {r5["reply"][:120]}')
assert 'appointment' in r5['reply'].lower()
print('  PASS')

print("\n=== Test 6: Booking shown in appointments ===")
apts = req('GET', '/appointments/')
print(f'  Total appointments: {len(apts)}')
assert len(apts) >= 1
print(f'  Status: {apts[0]["status"]}')
assert apts[0]['status'] == 'scheduled'
print('  PASS')

print("\n=== Test 7: Admin dashboard shows stats ===")
dash = req('GET', '/admin/dashboard')
print(f'  Patients: {dash["stats"]["total_patients"]}')
print(f'  Appointments: {dash["stats"]["total_appointments"]}')
assert dash['stats']['total_patients'] >= 1
assert dash['stats']['total_appointments'] >= 1
print('  PASS')

proc.terminate()
proc.wait()
print("\n========================================")
print("  ALL 7 TESTS PASSED!")
print("========================================")
