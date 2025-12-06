// Script to test the resend-email function
const url = 'https://functions.poehali.dev/114e3ead-bfe6-4d0c-a445-e65c05ec5a37';

const data = {
  email: 'golosova1989@internet.ru',
  name: 'Валентина',
  amount: 2999
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => {
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    return response.text();
  })
  .then(body => {
    console.log('Response Body:', body);
    try {
      const json = JSON.parse(body);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      // Body is not JSON
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
