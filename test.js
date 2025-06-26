function getPromiseFromEvent(item, event) {
  return new Promise((resolve) => {
    const listener = () => {
      item.removeEventListener(event, listener);
      resolve();
    }
    item.addEventListener(event, listener);
  })
}

async function waitForButtonClick(playerButton) {
  const div = document.querySelector("div")
  const button = document.querySelector(playerButton)
  div.innerText = "Waiting for you to press the button"
  await getPromiseFromEvent(button, "click")
  div.innerText = "The button was pressed!"
}
waitForButtonClick()