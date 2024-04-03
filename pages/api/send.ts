import { sendEmail } from "../../utils/sendgrid";
import { sendSlack } from "../../utils/slack";

export const runtime = "edge";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(req: Request, res: Response) {
  const request = await req.json();

  const {
    slackChannel,
    slackToken,
    sendgridToken,
    fromEmail,
    toEmail,
    slackMessage,
    subject,
    body,
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

  try {
    const slack = await sendSlack(slackMessage, slackChannel, slackToken);
    console.log(`🚀 > slack:`, slack);
  } catch (error) {
    console.error("Error sending slack:", error);

    return new Response(JSON.stringify(error), {
      headers: {
        "content-type": "application/json",
      },
      status: 400,
    });
  }

  // try {
  const sendgrid = await sendEmail(
    fromEmail,
    toEmail,
    subject,
    sendgridToken,
    body || subject
  );
  console.log(`🚀 > sendgrid:`, sendgrid);
  // } catch (error: any) {
  //   console.error("Error sending email:", error);

  //   return new Response(JSON.stringify(error), {
  //     headers: {
  //       "content-type": "application/json",
  //     },
  //     status: 400,
  //   });
  // }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}
