# Apple Developer Certificate Setup - Step by Step

## Current Step: Generate CSR (Certificate Signing Request)

### Instructions for Keychain Access:

1. **Open Keychain Access:**
   - Press `Cmd + Space` (Spotlight)
   - Type "Keychain Access"
   - Press Enter

2. **Request a Certificate:**
   - Menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**

3. **Fill in the form:**
   - **User Email Address**: `jeff.toffoli@quallaa.com` (or your Apple ID email)
   - **Common Name**: `Jeff Toffoli` (your name)
   - **CA Email Address**: Leave blank
   - **Request is**: Select **"Saved to disk"**
   - **Let me specify key pair information**: Leave unchecked
   - Click **Continue**

4. **Save the file:**
   - Save as: `CertificateSigningRequest.certSigningRequest`
   - Location: Desktop or Downloads (easy to find)
   - Click **Save**
   - Click **Done**

5. **Back to Apple Developer Website:**
   - Click **"Choose File"**
   - Select the `CertificateSigningRequest.certSigningRequest` file you just saved
   - Click **Continue**

6. **Download Your Certificate:**
   - Apple will generate your certificate
   - Click **Download**
   - Save as: `developerID_application.cer`

7. **Install Certificate:**
   - Double-click the downloaded `.cer` file
   - It will automatically install in Keychain Access
   - Should appear under "My Certificates" in Keychain Access

8. **Verify Installation:**
   Open Terminal and run:
   ```bash
   security find-identity -v -p codesigning
   ```

   You should see something like:
   ```
   1) ABC123XYZ "Developer ID Application: Jeff Toffoli (C5BM8DML5Q)"
   ```

9. **Copy Your Identity String:**
   - Copy the full string in quotes: `"Developer ID Application: Jeff Toffoli (C5BM8DML5Q)"`
   - You'll need this for the `.env` file

## Next: Create App-Specific Password

After certificate is installed:

1. Go to: https://appleid.apple.com/
2. Sign in
3. Section: **Security** → **App-Specific Passwords**
4. Click **Generate Password**
5. Label: "Quallaa Code Signing"
6. **Copy the password** (shown only once!)
7. Save it somewhere safe

## Create .env File

Copy `.env.example` to `.env`:

```bash
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native
cp .env.example .env
```

Edit `.env` and fill in:

```bash
APPLE_IDENTITY="Developer ID Application: Jeff Toffoli (C5BM8DML5Q)"
APPLE_ID="jeff.toffoli@quallaa.com"
APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"  # App-specific password from step above
APPLE_TEAM_ID="C5BM8DML5Q"
```

## Test Code Signing

Once `.env` is set up:

```bash
cd examples/electron
source ../../.env  # Load environment variables
yarn package
```

If successful, you'll get a DMG file in `examples/electron/dist/`!

---

**Current Status**: Waiting for CSR generation on your Mac
**Next**: Upload CSR to Apple Developer website
