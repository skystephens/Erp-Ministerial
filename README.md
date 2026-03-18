<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1biazscbQOwQddE_-5C6zwxHIlzkYf_J9

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub

1. Initialize Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ERP Ministerial Local Mode"
   ```
2. Create a repository on GitHub.
3. Link and push:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

## Deploy to Render (Static Site)

Since this version uses **LocalStorage** (Client-side database), it can be deployed as a Static Site.

1. Go to Render Dashboard.
2. Click **New +** -> **Static Site**.
3. Connect your GitHub repository.
4. Use the following settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Click **Create Static Site**.

**Note:** In this mode, data is saved in the user's browser. If you access the URL from a different device, the database will be empty (or different). Use the "Export JSON" feature in Admin Panel to move data.
