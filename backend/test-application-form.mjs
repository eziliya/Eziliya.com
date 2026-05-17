import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8080';

console.log('=== Testing Application Form (Intentional Failure Scenarios) ===\n');

// Test data
const testApplications = [
    {
        name: "Test 1: Processing Error",
        data: {
            applicantName: "John Doe",
            email: "john.doe@example.com",
            phoneNumber: "9876543210",
            simulateFailure: "processing_error"
        }
    },
    {
        name: "Test 2: Validation Failure",
        data: {
            applicantName: "Jane Smith",
            email: "jane.smith@example.com",
            phoneNumber: "9876543211",
            simulateFailure: "validation_failure"
        }
    },
    {
        name: "Test 3: Duplicate Submission",
        data: {
            applicantName: "Bob Johnson",
            email: "bob.johnson@example.com",
            phoneNumber: "9876543212",
            simulateFailure: "duplicate_submission"
        }
    },
    {
        name: "Test 4: System Unavailable",
        data: {
            applicantName: "Alice Williams",
            email: "alice.williams@example.com",
            phoneNumber: "9876543213",
            simulateFailure: "system_unavailable"
        }
    },
    {
        name: "Test 5: Timeout Error",
        data: {
            applicantName: "Charlie Brown",
            email: "charlie.brown@example.com",
            phoneNumber: "9876543214",
            simulateFailure: "timeout"
        }
    },
    {
        name: "Test 6: Unknown Error",
        data: {
            applicantName: "David Miller",
            email: "david.miller@example.com",
            phoneNumber: "9876543215",
            simulateFailure: "unknown"
        }
    },
    {
        name: "Test 7: Missing Required Fields",
        data: {
            applicantName: "Eve Davis",
            // Missing email and phoneNumber
        }
    },
    {
        name: "Test 8: Invalid Email Format",
        data: {
            applicantName: "Frank Wilson",
            email: "invalid-email",
            phoneNumber: "9876543216"
        }
    },
    {
        name: "Test 9: Invalid Phone Number",
        data: {
            applicantName: "Grace Taylor",
            email: "grace.taylor@example.com",
            phoneNumber: "123" // Invalid - not 10 digits
        }
    }
];

// Function to test application submission
async function testApplicationSubmission(testCase) {
    try {
        console.log(`\n📝 ${testCase.name}`);
        console.log('Request Data:', JSON.stringify(testCase.data, null, 2));
        
        const response = await fetch(`${BASE_URL}/application-form/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testCase.data)
        });
        
        const result = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (!result.success) {
            console.log('✅ Expected Failure - Form submission failed as intended');
        } else {
            console.log('❌ Unexpected Success - Form should have failed');
        }
        
    } catch (error) {
        console.error('❌ Request Error:', error.message);
    }
}

// Function to get all application forms
async function getAllApplicationForms() {
    try {
        console.log('\n\n📋 Fetching All Application Forms...\n');
        
        const response = await fetch(`${BASE_URL}/application-form/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        console.log(`Status: ${response.status}`);
        console.log(`Total Forms: ${result.count}`);
        
        if (result.data && result.data.length > 0) {
            console.log('\nForms Summary:');
            result.data.forEach((form, index) => {
                console.log(`\n${index + 1}. ${form.applicantName}`);
                console.log(`   Email: ${form.email}`);
                console.log(`   Phone: ${form.phoneNumber}`);
                console.log(`   Status: ${form.status}`);
                console.log(`   Failure Reason: ${form.failureReason || 'N/A'}`);
                console.log(`   Created: ${new Date(form.createdAt).toLocaleString()}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error fetching forms:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting tests in 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test each scenario
    for (const testCase of testApplications) {
        await testApplicationSubmission(testCase);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
    
    // Get all forms at the end
    await getAllApplicationForms();
    
    console.log('\n\n=== All Tests Completed ===');
    console.log('\n📌 Summary:');
    console.log('- All application form submissions are designed to fail');
    console.log('- Different failure scenarios are simulated');
    console.log('- Forms are saved to database with "failed" or "rejected" status');
    console.log('- Check the database to see all failed submissions');
}

// Run the tests
runAllTests().catch(console.error);

// Made with Bob
