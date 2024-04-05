export const sendSlack = (
  text: string,
  channel: string,
  slackToken: string,
  ts: string,
  newTs: boolean
) => {
  const apiUrl = "https://slack.com/api/chat.postMessage";

  const headers = {
    Authorization: `Bearer ${slackToken}`,
    "Content-Type": "application/json; charset=utf-8",
  };

  const data: any = {
    channel,
    text,
  };

  if (!newTs) {
    data.thread_ts = ts;
    // data.reply_broadcast = true;
    data.as_user = true;
  }

  return fetch(apiUrl, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  }).then((response) => response.json());
};
