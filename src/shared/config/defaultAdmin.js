// Task 7 — Registration Changes: default Admin account configuration.
//
// Admin is no longer a selectable role on the Registration page, so the
// application must always have exactly one Admin account available to
// log in with. This file defines that account's credentials. Every value
// can be overridden at build time via a CRA environment variable (e.g. in
// a .env / .env.production file) without touching any code:
//
//   REACT_APP_DEFAULT_ADMIN_EMAIL=admin@yourcompany.com
//   REACT_APP_DEFAULT_ADMIN_PASSWORD=YourStrongPassword1!
//   REACT_APP_DEFAULT_ADMIN_NAME=System Administrator
//   REACT_APP_DEFAULT_ADMIN_USERNAME=sysadmin01
//
// If a variable isn't set, the fallback below is used instead so the app
// always has a working default admin out of the box.
export const DEFAULT_ADMIN_CONFIG = {
  email: process.env.REACT_APP_DEFAULT_ADMIN_EMAIL || "admin1@trianxt.com",
  password: process.env.REACT_APP_DEFAULT_ADMIN_PASSWORD || "Admin@123",
  name: process.env.REACT_APP_DEFAULT_ADMIN_NAME || "System Administrator",
  username: process.env.REACT_APP_DEFAULT_ADMIN_USERNAME || "sysadmin01",
};