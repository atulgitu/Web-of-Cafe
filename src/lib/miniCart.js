// Pages where phones show the floating "View cart" bar (App pads the footer for it there).
const shownOn = ["/", "/menu"];

export const miniCartShownOn = (pathname) => shownOn.includes(pathname);
