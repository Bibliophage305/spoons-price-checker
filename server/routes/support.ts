export default defineEventHandler((event) => {
  return sendRedirect(event, "https://buymeacoffee.com/bibliophage305", 302);
});
