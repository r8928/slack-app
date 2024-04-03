export const sendSlack = (
  text: string,
  channel: string,
  slackToken: string
) => {
  const apiUrl = "https://slack.com/api/chat.postMessage";

  const headers = {
    Authorization: `Bearer ${slackToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };

  const data = {
    channel,
    text,
  };

  return fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  }).then((response) => response.json());
};
