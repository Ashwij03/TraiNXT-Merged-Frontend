# TriaNXT Frontend Dev Server

## How to reproduce uncommitted artifacts
This is a Create React App project. No additional build artifacts or env files are needed — `node_modules` is already present in the workspace.

## How to run the server
1. Ensure port 3001 is free (port 3000 may already be in use by another process).
2. From the project root, start the CRA dev server with PORT set:
   ```
   set PORT=3001 && npm run start
   ```
3. The dev server starts on http://localhost:3001.
4. CRA auto-selects the next free port if 3001 is taken.

## Current status
- **Server running:** PID 11284 (node), listening on 0.0.0.0:3001
- **HTTP status:** 200 confirmed via PowerShell
- **URL:** http://localhost:3001
