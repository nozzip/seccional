// Using native fetch

async function main() {
  try {
    const res = await fetch('https://i.ibb.co/BGr4F84/Hotel-colonial.webp');
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Content-Length:', res.headers.get('content-length'));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main();
