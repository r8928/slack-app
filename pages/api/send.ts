import { NextApiRequest, NextApiResponse } from "next";
import { sendSlack } from "../../utils/slack";
import { sendEmail } from "../../utils/sendgrid";

export const runtime = "edge";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    slackChannel,
    slackToken,
    sendgridToken,
    fromEmail,
    toEmail,
    slackMessage,
    subject,
    body,
  } = JSON.parse(req.body as any);

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
    return res.status(422).json({ errors });
  }

  try {
    const slack = await sendSlack(slackMessage, slackChannel, slackToken);
    console.log(`🚀 > slack:`, slack);
  } catch (error) {
    console.error("Error sending slack:", error);
    return res.status(400).json({ error });
  }

  try {
    const sendgrid = await sendEmail(
      fromEmail,
      toEmail,
      subject,
      sendgridToken,
      body
    );
    console.log(`🚀 > sendgrid:`, sendgrid);
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(400).json({ error });
  }

  return res.status(200).json({ success: true });
}
