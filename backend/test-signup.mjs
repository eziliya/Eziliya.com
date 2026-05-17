const testSignup = async () => {
    try {
        // Generate a random contact number
        const randomContact = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        
        console.log('Testing signup with contact number:', randomContact);
        
        const response = await fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test User ' + Date.now(),
                contactNumber: randomContact,
                password: 'test123456',
                role: 'sales-team'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ SUCCESS! User registered successfully');
            console.log('Response:', data);
            console.log('Status:', response.status);
        } else {
            console.log('❌ ERROR:', data.message);
            console.log('Status:', response.status);
        }
        
    } catch (error) {
        console.log('❌ EXCEPTION:', error.message);
    }
};

testSignup();

// Made with Bob
