// Quick test script
const url = 'https://www.youtube.com/watch?v=cBWg5r0F-cc&list=RDcBWg5r0F-cc&start_radio=1';
const encodedUrl = encodeURIComponent(url);
const apiUrl = `http://localhost:3000/api/convert?url=${encodedUrl}`;

console.log('Testing URL:', url);
console.log('API endpoint:', apiUrl);
console.log('\nYou can test by clicking this URL or paste it in the browser:');
console.log(apiUrl);
console.log('\nOr use curl:');
console.log(`curl "${apiUrl}" -o output.mp3`);
