"use client";

import { useEffect, useState } from "react";

export function Settings(props: any) {
  const [sendgridToken, setSendgridTokenInput] = useState("");
  const [slackToken, setSlackTokenInput] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  // load local storage
  useEffect(() => {
    setSendgridTokenInput(localStorage.getItem("sendgrid-token") || "");
    setSlackTokenInput(localStorage.getItem("slack-token") || "");
    setFromEmail(localStorage.getItem("email-from") || "");
  }, []);

  function saveSettings(e: any) {
    console.log(`🚀 > saveSettings > e:`, e);
    console.log(`🚀 > saveSettings > sendgridToken:`, sendgridToken);
    e.preventDefault();

    localStorage.setItem("sendgrid-token", sendgridToken);
    localStorage.setItem("slack-token", slackToken);
    localStorage.setItem("email-from", fromEmail);

    setTimeout(() => {
      props.onClose();
    });
  }

  return (
    <form
      id="settings-form"
      onSubmit={saveSettings}
      className="rounded-lg p-5 shadow-2xl mx-auto w-[350px] flex flex-col gap-5 backdrop-blur-md"
    >
      <div>
        <label htmlFor="sendgrid-token">SendGrid token</label>
        <input
          type="text"
          id="sendgrid-token"
          className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
          value={sendgridToken}
          onChange={(e) => setSendgridTokenInput(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email-from">From email</label>
        <input
          type="email"
          id="email-from"
          className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
        />
      </div>

      <div>
        <label>To email</label>
        <input
          type="text"
          disabled
          className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
          value={process.env.NEXT_PUBLIC_TO_EMAIL}
        />
      </div>

      <div>
        <label>Slack channel</label>
        <input
          type="text"
          disabled
          className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
          value={process.env.NEXT_PUBLIC_SLACK_CHANNEL}
        />
      </div>

      <div>
        <label htmlFor="slack-token">Slack token</label>
        <input
          type="text"
          id="slack-token"
          className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
          value={slackToken}
          onChange={(e) => setSlackTokenInput(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-[100%] text-white bg-blue-700
          hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
          rounded-lg px-5 py-2.5
          dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Save
      </button>
    </form>
  );
}
