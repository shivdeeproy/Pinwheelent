## 🛠️ Prerequisite 1: Main Domain Router Setup
You must configure the root `.htaccess` in your primary `public_html` directory to forward traffic to the built subfolder (`public_html/pinwheel/dist`).

1. Open **cPanel File Manager** and go to **`public_html/`**.
2. Create or edit the file named **`.htaccess`** and paste this code:

```apache
<FilesMatch "\.(html|htm)$">
  FileETag None
  <IfModule mod_headers.c>
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </IfModule>
</FilesMatch>

RewriteEngine On
RewriteBase /

# Forward all incoming traffic to the pinwheel/dist folder
RewriteCond %{REQUEST_URI} !^/pinwheel/dist/
RewriteRule ^(.*)$ pinwheel/dist/$1 [L]
```

---

## 🛠️ Prerequisite 2: React Routing Fallback Setup (Preventing 404 Wipes)
To ensure sub-routes like `/admin` work without throwing 404 errors, and **to prevent the build tool from deleting your router configuration on every build**, you must place the fallback `.htaccess` file inside your source code's **`public/`** folder.

1. Go to your project repository on cPanel (or local workspace) and open the **`public/`** folder (`public_html/pinwheel/public/`).
2. Create a file named **`.htaccess`** and paste this code:

```apache
RewriteEngine On
RewriteBase /pinwheel/dist/

# If the file or folder doesn't exist inside dist/, load index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . index.html [L]
```
*(By placing this in `public/`, Vite will automatically copy it to the `dist/` folder every time `npm run build` is executed).*

---

## 🚀 Method 1: Deployment WITH Node.js in cPanel
Use this method if you want to pull updates via Git on the server and build directly.

### Step 1: Create the Node.js application in cPanel
1. Go to **cPanel** -> **Setup Node.js App** (under Software).
2. Click **Create Application**:
   * **Node.js version**: `18` or higher
   * **Application mode**: `Production`
   * **Application root**: `public_html/pinwheel`
   * **Application startup file**: `app.js` (type a dummy name, it won't be used)
   * Click **Create**.
3. Under the page header, copy the environment activation command. It looks like this:
   ```bash
   source /home/USERNAME/nodevenv/public_html/pinwheel/18/bin/activate && cd /home/USERNAME/public_html/pinwheel
   ```

### Step 2: Configure Environment Variables
1. Go to **cPanel File Manager** -> **`public_html/pinwheel/`**.
2. Create a file named **`.env`** and paste your environment keys (Firebase, Web3Forms, etc.).

### Step 3: Run the installation & build in the terminal
1. Open the **cPanel Terminal** and paste the activation command you copied in **Step 1**.
2. Install dependencies (force DevDependencies to prevent Vite errors in production mode):
   ```bash
   npm install --production=false
   ```
3. Compile the production bundle:
   ```bash
   npm run build
   ```

### Step 4: Turn off Node.js app background running
Since React compiles down to static HTML/CSS files served by Apache/LiteSpeed directly:
1. Go to **cPanel** -> **Setup Node.js App**.
2. Click **Stop** on the application. (This turns off Passenger so Apache handles your pages directly).

---

## 💻 Method 2: Deployment WITHOUT Node.js (Local Build)
Use this method if your server does not support Node.js or if you prefer to build locally and upload files.

### Step 1: Build locally on your machine
1. Open the terminal inside your local project directory and compile:
   ```bash
   npm run build
   ```
2. This creates a folder named **`dist`** containing static HTML, CSS, and JS files.

### Step 2: ZIP the build contents
1. Go inside your local **`dist`** folder.
2. Select **all files and folders** inside `dist`.
3. Compress them into a ZIP archive named `build.zip`.
   *⚠️ Important: Compressing the parent `dist` folder itself will cause 404 errors. You must select the items inside `dist` and compress them.*

### Step 3: Upload and extract in cPanel
1. Open **cPanel File Manager** -> **`public_html/`**.
2. Create the folder **`pinwheel`** and inside it create **`dist`**. (Your folder structure should be `public_html/pinwheel/dist/`).
3. Set both the `pinwheel` and `dist` folder permissions to **`0755`** (Right-click -> Change Permissions).
4. Go inside `public_html/pinwheel/dist/` and click **Upload** to upload `build.zip`.
5. Select `build.zip` and click **Extract**.
6. Ensure files inside have **`0644`** permissions and folders have **`0755`**.

---

## 🌐 Firebase Domain Whitelisting
To ensure the admin panel login works, your live domain must be authorized in the Firebase console:
1. Log into your **[Firebase Console](https://console.firebase.google.com/)**.
2. Navigate to **Authentication** -> **Settings** tab -> **Authorized Domains**.
3. Click **Add Domain** and input your domain name (e.g., `pinwheelent.in` and `www.pinwheelent.in`).

### 📦 Firebase Firestore Database Structure
If you are setting up the database on a new Firebase project, make sure these three collections are created:
1. **`works`**: Stores expo projects details.
2. **`reviews`**: Stores testimonials/Google reviews.
3. **`clients`**: Stores client/brand logos.
4. **`settings`**: Stores custom visibility configurations. Ensure you create a document with ID **`sectionVisibility`** inside `settings` with fields:
   - `showWork` (boolean): `true`
   - `showBrands` (boolean): `true`
   - `showReviews` (boolean): `true`

---

## 📧 Email Setup (Web3Forms)
Your contact form uses **Web3Forms** to send emails without requiring a backend.

1. Go to **[Web3Forms](https://web3forms.com/)**.
2. Enter the email address where you want to receive inquiries (e.g., `hello@pinwheelent.in`) and submit the form to get a free **Access Key**.
3. Open your `.env` file on cPanel and paste your access key:
   ```text
   VITE_WEB3FORMS_ACCESS_KEY=your_key_here
   ```
4. Rebuild the application (`npm run build`) so the contact form compiles with the new key.


---

## 🔄 Updating the Website (Git Updates)
When you push new changes to GitHub and want to update the live server:

1. Open the **cPanel Terminal**.
2. Run your Node app virtualenv activation command to load Node/npm in the path:
   ```bash
   source /home/USERNAME/nodevenv/public_html/pinwheel/18/bin/activate
   ```
3. Navigate to your project folder:
   ```bash
   cd /home/USERNAME/public_html/pinwheel
   ```
4. Pull the latest code from GitHub:
   ```bash
   git pull origin main
   ```
5. Compile the changes:
   ```bash
   npm run build
   ```
   *(Vite will build the updates and automatically copy the routing `.htaccess` file back into the `dist` folder. No files need to be copied manually).*
