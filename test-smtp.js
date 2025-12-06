// Test script for SMTP email delivery via resend-email backend function
// Run with: node test-smtp.js

const url = 'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37';

const payload = {
  email: "golosova1989@internet.ru",
  name: "Валентина",
  amount: 1
};

async function testSMTP() {
  try {
    console.log('='.repeat(70));
    console.log('SMTP EMAIL DELIVERY TEST - resend-email function');
    console.log('='.repeat(70));
    console.log('\nURL:', url);
    console.log('Method: POST');
    console.log('\nRequest Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n' + '='.repeat(70));
    console.log('Sending request...\n');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('='.repeat(70));
    console.log('RESPONSE');
    console.log('='.repeat(70));
    console.log('\nStatus Code:', response.status, response.statusText);
    console.log('\nResponse Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const contentType = response.headers.get('content-type');
    let body;
    
    console.log('\nResponse Body:');
    if (contentType && contentType.includes('application/json')) {
      body = await response.json();
      console.log(JSON.stringify(body, null, 2));
    } else {
      body = await response.text();
      console.log(body);
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (!response.ok) {
      console.log('ERROR: Response was not OK (status:', response.status + ')');
      console.log('='.repeat(70));
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: body
    };
  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('EXCEPTION OCCURRED');
    console.log('='.repeat(70));
    console.log('\nError Type:', error.constructor.name);
    console.log('Error Message:', error.message);
    if (error.stack) {
      console.log('\nStack Trace:');
      console.log(error.stack);
    }
    console.log('\n' + '='.repeat(70));
    throw error;
  }
}

testSMTP().catch(() => process.exit(1));