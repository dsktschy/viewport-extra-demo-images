import constants from "../../constants.json" with { type: "json" };

const documentElement = document.documentElement;
const touchingAttributeName = `${constants.TOUCHING_ATTRIBUTE_NAME}`;

documentElement.addEventListener("touchstart", (event) => {
  const { clientX, clientY } = event.touches[0];
  documentElement.style.setProperty("--pointer-x", `${Math.trunc(clientX)}px`);
  documentElement.style.setProperty("--pointer-y", `${Math.trunc(clientY)}px`);
  documentElement.setAttribute(touchingAttributeName, "");
});

documentElement.addEventListener("touchmove", (event) => {
  const { clientX, clientY } = event.touches[0];
  documentElement.style.setProperty("--pointer-x", `${Math.trunc(clientX)}px`);
  documentElement.style.setProperty("--pointer-y", `${Math.trunc(clientY)}px`);
});

documentElement.addEventListener("touchend", () => {
  documentElement.removeAttribute(touchingAttributeName);
});

document.body.addEventListener("scroll", ({ target }) => {
  if (!target) return;
  documentElement.style.setProperty(
    "--body-scroll-left-number",
    `${Math.trunc((target as HTMLElement).scrollLeft)}`,
  );
});
