const API_BASE_URL = "http://127.0.0.1:5000";

export const ServerAPI = async (payload) => {
  try {
    let response = await fetch(`${API_BASE_URL}/run-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.log(err);
  }
};
