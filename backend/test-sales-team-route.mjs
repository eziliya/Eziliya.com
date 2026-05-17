import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

async function testSalesTeamRoute() {
    console.log('Testing Sales Team Form Route...');
    console.log(`URL: ${API_BASE_URL}/sales-team-form/submit`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/sales-team-form/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firmName: 'Test Firm',
                propertyType: 'Flat',
                customerName: 'Test Customer',
                customerContactNumber: '9876543210',
                customerAddress: 'Test Address',
                propertyUnitRate: 5000,
                customerPayAmount: 100000,
                customerLoanAmount: 200000,
                aadharCardPhoto: 'test-url',
                panCardPhoto: 'test-url',
                saleDraftPdf: 'test-url',
                propertyValuationReportPdf: 'test-url'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('✅ Route is working!');
        } else {
            console.log('❌ Route returned error');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nPossible issues:');
        console.log('1. Backend server is not running');
        console.log('2. Backend is running on a different port');
        console.log('3. Route is not registered properly');
    }
}

testSalesTeamRoute();

// Made with Bob
