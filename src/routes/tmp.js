function loadScript(src) {
  return new Promise((resolve, reject) => {
    let script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));

    document.head.append(script);
  });
}

let promise = loadScript("asd");

promise.then(
  (script) => {
    alert(script);
  },
  (error) => {
    alert(error);
  }
);

promise.then((script) => {
  alert("asdsad");
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(() => resolve, ms));
}

delay(3000).then(() => alert("runs after 3 seconds"));

showCircle(150, 150, 100, (div) => {
  div.classList.add("message-ball");
  div.append("Hello, world!");
});
