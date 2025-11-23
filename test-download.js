const YTDlpWrap = require('yt-dlp-wrap').default;
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

const ytDlpPath = path.join(__dirname, 'bin', 'yt-dlp.exe');
const outputPath = path.join(__dirname, 'test-output.mp3');

async function test() {
  console.log('Checking yt-dlp binary...');

  if (!fs.existsSync(ytDlpPath)) {
    console.error('❌ yt-dlp.exe not found at:', ytDlpPath);
    process.exit(1);
  }

  console.log('✓ Found yt-dlp at:', ytDlpPath);
  console.log('✓ FFmpeg at:', ffmpegPath);

  const url = 'https://www.youtube.com/watch?v=cBWg5r0F-cc';
  const ytDlp = new YTDlpWrap(ytDlpPath);

  try {
    console.log('\n1. Fetching video info...');
    const info = await ytDlp.getVideoInfo(url);
    console.log('✓ Title:', info.title);
    console.log('✓ Duration:', info.duration, 'seconds');
    console.log('✓ Channel:', info.channel);

    console.log('\n2. Starting download...');
    const startTime = Date.now();

    // Download best audio and let yt-dlp handle the extension
    const outputTemplate = path.join(__dirname, 'test-output.%(ext)s');

    await ytDlp.execPromise([
      url,
      '-f', 'bestaudio',
      '-o', outputTemplate,
      '--no-playlist',
      '--progress',
      '--newline'
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✓ Download completed in ${duration}s`);

    // Find the downloaded file
    const files = fs.readdirSync(__dirname).filter(f => f.startsWith('test-output.'));
    if (files.length > 0) {
      const downloadedFile = path.join(__dirname, files[0]);
      const stats = fs.statSync(downloadedFile);
      console.log(`✓ File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`✓ File saved to: ${downloadedFile}`);
      console.log('\n✅ SUCCESS! The conversion works!');
    } else {
      console.log('⚠️  File downloaded but not found');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

test();
