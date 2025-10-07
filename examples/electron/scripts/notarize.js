const { notarize } = require('@electron/notarize');
const path = require('path');
const fs = require('fs');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // Load .env file from repository root
  const envPath = path.join(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#][^=]*)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
        process.env[key] = value;
      }
    });
  }

  // Check if required credentials are available
  const hasCredentials = process.env.APPLE_ID &&
                         process.env.APPLE_ID_PASSWORD &&
                         process.env.APPLE_TEAM_ID;

  if (!hasCredentials) {
    console.log('\n⚠️  Skipping notarization: Apple credentials not found');
    console.log('   Set APPLE_ID, APPLE_ID_PASSWORD, and APPLE_TEAM_ID to enable notarization');
    console.log('   App will be signed but not notarized\n');
    return;
  }

  // Check if notarization is explicitly disabled
  if (process.env.SKIP_NOTARIZATION === 'true') {
    console.log('\n⚠️  Skipping notarization: SKIP_NOTARIZATION=true\n');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log('\n🔐 Starting notarization (this may take 10-30 minutes)...');
  console.log(`   App: ${appName}.app`);
  console.log(`   Apple ID: ${process.env.APPLE_ID}\n`);

  try {
    await notarize({
      appBundleId: 'com.quallaa.ide',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    console.log('\n✅ Notarization successful\n');
  } catch (error) {
    console.error('\n❌ Notarization failed:', error.message);
    console.warn('⚠️  Continuing build without notarization\n');
    // Don't throw - allow build to continue
  }
};
