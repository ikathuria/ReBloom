// Ambient module declarations for CSS imports used by the Expo SDK 57 default
// template (web styling). These types are otherwise only generated once the Expo
// dev server runs, so `tsc --noEmit` in CI needs them declared here.
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
