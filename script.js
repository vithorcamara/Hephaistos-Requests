const methodSelect = document.getElementById("method");
const bodyContainer = document.getElementById("bodyContainer");

function toggleBody() {
  const method = methodSelect.value;

  if (method === "GET" || method === "DELETE") {
    bodyContainer.style.display = "none";
  } else {
    bodyContainer.style.display = "block";
  }
}

methodSelect.addEventListener("change", toggleBody);

window.addEventListener("load", () => {
  document.getElementById("base").value =
    localStorage.getItem("miniPostmanBase") || "";

  document.getElementById("port").value =
    localStorage.getItem("miniPostmanPort") || "";

  toggleBody();
});

async function enviar() {
  const method =
    document.getElementById("method").value;

  const base =
    document.getElementById("base").value.trim();

  const port =
    document.getElementById("port").value.trim();

  const endpoint =
    document.getElementById("endpoint").value.trim();

  const bodyText =
    document.getElementById("body").value.trim();

  const headersText =
    document.getElementById("headers").value.trim();

  document.getElementById("status").innerText = "";
  document.getElementById("time").innerText = "";
  document.getElementById("response").innerText = "";
  document.getElementById(
    "responseHeaders"
  ).innerText = "";

  localStorage.setItem(
    "miniPostmanBase",
    base
  );

  localStorage.setItem(
    "miniPostmanPort",
    port
  );

  const normalizedBase =
    base.replace(/\/$/, "");

  const normalizedEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

  const url = port
    ? `${normalizedBase}:${port}${normalizedEndpoint}`
    : `${normalizedBase}${normalizedEndpoint}`;

  let headers = {
    "Content-Type": "application/json"
  };

  let body;

  try {
    if (headersText) {
      headers = {
        ...headers,
        ...JSON.parse(headersText)
      };
    }
  } catch (error) {
    document.getElementById(
      "status"
    ).innerText = "Erro nos headers";

    document.getElementById(
      "response"
    ).innerText = error.message;

    return;
  }

  try {
    if (
      method !== "GET" &&
      method !== "DELETE" &&
      bodyText
    ) {
      body = JSON.parse(bodyText);
    }
  } catch (error) {
    document.getElementById(
      "status"
    ).innerText = "Erro no body";

    document.getElementById(
      "response"
    ).innerText = error.message;

    return;
  }

  try {
    const start = performance.now();

    const response = await fetch(url, {
      method,
      headers,
      body:
        method !== "GET" &&
        method !== "DELETE" &&
        body
          ? JSON.stringify(body)
          : undefined
    });

    const end = performance.now();

    document.getElementById(
      "status"
    ).innerText =
      `${response.status} ${response.statusText}`;

    document.getElementById(
      "time"
    ).innerText =
      `${Math.round(end - start)} ms`;

    const responseHeaders = {};

    response.headers.forEach(
      (value, key) => {
        responseHeaders[key] = value;
      }
    );

    document.getElementById(
      "responseHeaders"
    ).innerText = JSON.stringify(
      responseHeaders,
      null,
      2
    );

    const contentType =
      response.headers.get("content-type");

    let output;

    if (
      contentType &&
      contentType.includes("application/json")
    ) {
      const json = await response.json();

      output = JSON.stringify(
        json,
        null,
        2
      );
    } else {
      output = await response.text();
    }

    document.getElementById(
      "response"
    ).innerText = output;

  } catch (error) {
    document.getElementById(
      "status"
    ).innerText = "Erro";

    document.getElementById(
      "response"
    ).innerText = error.message;
  }
}