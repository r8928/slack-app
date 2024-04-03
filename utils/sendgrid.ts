export const sendEmail = (
  from: string,
  to: string,
  subject: string,
  sendgridApiKey: string,
  body: string
) => {
  const sendgridApiUrl = "https://api.sendgrid.com/v3/mail/send";

  // const headers = {
  //   Authorization: `Bearer ${sendgridApiKey}`,
  //   "Content-Type": "application/json",
  //   Accept: "application/json",
  // };

  // const emailData = {
  //   personalizations: [
  //     {
  //       to: [{ email: to }],
  //     },
  //   ],
  //   from: { email: from },
  //   subject,
  //   content: [{ type: "text/plain", value: body || "" }],
  // };

  // const options: any = {
  //   method: "POST",
  //   mode: "no-cors",
  //   headers: headers,
  //   body: JSON.stringify(emailData),
  // };

  // return fetch(sendgridApiUrl, options).then((response) => response.text());

  const data = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [{ type: "text/plain", value: body || "" }],
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  return fetch(sendgridApiUrl, options).then((response) => response.text());
};
