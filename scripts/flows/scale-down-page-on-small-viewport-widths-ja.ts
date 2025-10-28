import type { Flow } from "../internal/Flow.ts";

export const execute: Flow["execute"] = async ({
  browser,
  devices,
  artifactName,
  constants: {
    PAGE_LOAD_DELAY,
    INTERACTION_DELAY,
    TOUCH_SLOP,
    TOUCH_MOVE_FRAME_COUNT,
    TOUCH_MOVE_FRAME_DELAY,
    VIDEOS_DIRECTORY,
    POINTER_VISIBLE_ATTRIBUTE_NAME,
    DEVICE_NAME,
    HOST,
    PORT,
  },
}) => {
  const context = await browser.newContext({
    ...devices[DEVICE_NAME],
    recordVideo: {
      // Directory for temporary video
      dir: VIDEOS_DIRECTORY,
    },
  });
  const page = await context.newPage();
  const video = page.video();
  if (!video) throw new Error("No video object");

  const response = await page.goto(
    `http://${HOST}:${PORT}/${artifactName}.html`,
  );
  const status = response?.status() ?? 0;
  if (status !== 200) throw new Error(`Invalid response status: ${status}`);

  const { x: leftPointerAnchorX, y: leftPointerAnchorY } = (await (
    await page.getByTestId("left-pointer-anchor")
  ).boundingBox()) ?? { x: 0, y: 0 };
  const { x: rightPointerAnchorX, y: rightPointerAnchorY } = (await (
    await page.getByTestId("right-pointer-anchor")
  ).boundingBox()) ?? { x: 0, y: 0 };
  const distance = { x: 0, y: 0 };
  const cdpSession = await context.newCDPSession(page);

  await page.waitForTimeout(PAGE_LOAD_DELAY);

  // Swipe invisibly by touch slop in advance for smooth pointer movement
  await page.evaluate(
    ({ POINTER_VISIBLE_ATTRIBUTE_NAME }) => {
      document.documentElement.removeAttribute(POINTER_VISIBLE_ATTRIBUTE_NAME);
    },
    { POINTER_VISIBLE_ATTRIBUTE_NAME },
  );
  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: rightPointerAnchorX - TOUCH_SLOP, y: rightPointerAnchorY },
    ],
  });
  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: rightPointerAnchorX, y: rightPointerAnchorY }],
  });
  await page.evaluate(
    ({ POINTER_VISIBLE_ATTRIBUTE_NAME }) => {
      document.documentElement.setAttribute(POINTER_VISIBLE_ATTRIBUTE_NAME, "");
    },
    { POINTER_VISIBLE_ATTRIBUTE_NAME },
  );
  await page.waitForTimeout(INTERACTION_DELAY);

  distance.x = leftPointerAnchorX - rightPointerAnchorX;
  distance.y = leftPointerAnchorY - rightPointerAnchorY;
  for (let i = 1; i <= TOUCH_MOVE_FRAME_COUNT; i++) {
    const ratio = i / TOUCH_MOVE_FRAME_COUNT;
    await cdpSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: Math.floor(rightPointerAnchorX + distance.x * ratio),
          y: Math.floor(rightPointerAnchorY + distance.y * ratio),
        },
      ],
    });
    // Make pointer element move more smoothly
    await new Promise((resolve) => setTimeout(resolve, TOUCH_MOVE_FRAME_DELAY));
  }
  await page.waitForTimeout(INTERACTION_DELAY);

  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [{ x: leftPointerAnchorX, y: leftPointerAnchorY }],
  });
  await page.waitForTimeout(INTERACTION_DELAY);

  // Swipe invisibly by touch slop in advance for smooth pointer movement
  await page.evaluate(
    ({ POINTER_VISIBLE_ATTRIBUTE_NAME }) => {
      document.documentElement.removeAttribute(POINTER_VISIBLE_ATTRIBUTE_NAME);
    },
    { POINTER_VISIBLE_ATTRIBUTE_NAME },
  );
  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: leftPointerAnchorX + TOUCH_SLOP, y: leftPointerAnchorY },
    ],
  });
  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: leftPointerAnchorX, y: leftPointerAnchorY }],
  });
  await page.evaluate(
    ({ POINTER_VISIBLE_ATTRIBUTE_NAME }) => {
      document.documentElement.setAttribute(POINTER_VISIBLE_ATTRIBUTE_NAME, "");
    },
    { POINTER_VISIBLE_ATTRIBUTE_NAME },
  );
  await page.waitForTimeout(INTERACTION_DELAY);

  distance.x = rightPointerAnchorX - leftPointerAnchorX;
  distance.y = rightPointerAnchorY - leftPointerAnchorY;
  for (let i = 1; i <= TOUCH_MOVE_FRAME_COUNT; i++) {
    const ratio = i / TOUCH_MOVE_FRAME_COUNT;
    await cdpSession.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: Math.floor(leftPointerAnchorX + distance.x * ratio),
          y: Math.floor(leftPointerAnchorY + distance.y * ratio),
        },
      ],
    });
    // Make pointer element move more smoothly
    await new Promise((resolve) => setTimeout(resolve, TOUCH_MOVE_FRAME_DELAY));
  }
  await page.waitForTimeout(INTERACTION_DELAY);

  await cdpSession.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [{ x: leftPointerAnchorX, y: leftPointerAnchorY }],
  });
  await page.waitForTimeout(INTERACTION_DELAY);

  await context.close();
  await video.saveAs(`${VIDEOS_DIRECTORY}${artifactName}.webm`);
  // Delete temporary video
  await video.delete();
};
