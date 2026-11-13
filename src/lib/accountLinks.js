// What each kind of account sees in its account menu. Every link goes to a page
// that exists for that role; the server still checks the role on every request.
const links = {
  CUSTOMER: [
    { to: "/profile?tab=orders", label: "My orders" },
    { to: "/profile?tab=details", label: "Account details" },
  ],
  STAFF: [
    { to: "/dashboard", label: "Orders & kitchen" },
    { to: "/rescue", label: "Rescue board" },
    { to: "/profile?tab=details", label: "Account details" },
  ],
  PARTNER: [
    { to: "/partner", label: "My pickups" },
    { to: "/rescue", label: "Available food" },
    { to: "/profile?tab=details", label: "Account details" },
  ],
};

export const accountLinks = (role) => links[role] ?? links.CUSTOMER;

// Where to go after signing in, when the visitor wasn't on their way somewhere else.
export const homeForRole = (role) => ({ STAFF: "/dashboard", PARTNER: "/partner" })[role] ?? "/";
