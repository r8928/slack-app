import { NextApiResponse } from "next";
import { sendEmail } from "src/utils/sendgrid";
import { sendSlack } from "src/utils/slack";

export const runtime = "edge";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(req: Request, res: NextApiResponse) {
  const request = await req.json();
  let errorMessage;

  const {
    slackChannel,
    slackToken,
    sendgridToken,
    fromEmail,
    toEmail,
    slackMessage,
    subject,
    body,
    ts,
    newTs,
    shouldSendEmail,
  } = request;

  console.log(`🚀 > handler > request:`, request);

  const errors = [];

  if (!slackMessage) {
    errors.push("Missing text");
  }
  if (!slackChannel) {
    errors.push("Missing slackChannel");
  }
  if (!slackToken) {
    errors.push("Missing slackToken");
  }
  if (!sendgridToken) {
    errors.push("Missing sendgridToken");
  }
  if (!fromEmail) {
    errors.push("Missing fromEmail");
  }
  if (!toEmail) {
    errors.push("Missing toEmail");
  }

  if (errors.length > 0) {
    console.error(`🚀 > errors:`, errors);

    return new Response(JSON.stringify(errors), {
      headers: {
        "content-type": "application/json",
      },
      status: 422,
    });
  }

  let messageTs = null;
  const slack = await sendSlack(
    slackMessage,
    slackChannel,
    slackToken,
    ts,
    newTs
  );
  console.log(`🚀 > sendSlack:`, slack);
  if (!slack.ok) {
    try {
      errorMessage = JSON.stringify({ SLACK: JSON.parse(slack) });
    } catch (error) {
      errorMessage = JSON.stringify({ SLACK: slack });
    }

    if (errorMessage) {
      return new Response(errorMessage, {
        headers: {
          "content-type": "application/json",
        },
        status: 400,
      });
    }
  } else {
    if (newTs) {
      messageTs = slack.ts || null;
    }
  }

  if (shouldSendEmail) {
    const sendgrid = await sendEmail(
      fromEmail,
      toEmail,
      subject,
      sendgridToken,
      body || "-"
    );
    console.log(`🚀 > sendEmail:`, sendgrid);
    if (sendgrid) {
      try {
        errorMessage = JSON.stringify({ SENDGRID: JSON.parse(sendgrid) });
      } catch (error) {
        errorMessage = JSON.stringify({ SENDGRID: sendgrid });
      }

      if (errorMessage) {
        return new Response(errorMessage, {
          headers: {
            "content-type": "application/json",
          },
          status: 400,
        });
      }
    }
  }

  return new Response(JSON.stringify({ success: true, ts: messageTs }), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}
