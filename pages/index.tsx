"use client";

import Head from "next/head";
import { useEffect, useState } from "react";

export default function Page() {
  // constants
  const toEmail = "rashid8928@gmail.com";
  const slackChannel = "D055T50M398";

  // init vars
  const [settingsContainer, setSettingsContainer] = useState(false);
  const [punchContainer, setPunchContainer] = useState(true);
  const [sendgridToken, setSendgridTokenInput] = useState("");
  const [slackToken, setSlackTokenInput] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [slackMessage, setSlackMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");

  // load local storage
  useEffect(() => {
    setSendgridTokenInput(localStorage.getItem("sendgrid-token") || "");
    setSlackTokenInput(localStorage.getItem("slack-token") || "");
    setFromEmail(localStorage.getItem("email-from") || "");

    getDates();
    generateText();
  }, []);

  function getDates() {
    const dateInput = document.getElementById(
      "current-date"
    ) as HTMLInputElement;
    const timeInput = document.getElementById(
      "current-time"
    ) as HTMLInputElement;

    const now = new Date();
    // Get local date in yyyy-mm-dd format
    const localDate = now.toISOString().slice(0, 10);

    // Get local time in HH:mm format
    const localTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    timeInput.value = localTime;
    dateInput.value = localDate;

    if (now.getHours() > 13) {
      (document.getElementById("check-out") as HTMLInputElement).click();
    } else {
      (document.getElementById("check-in") as HTMLInputElement).click();
    }
  }

  function formattedDate(date: string, time: string) {
    const inputDateString = `${date} ${time}`; // Replace this with your input date string
    const inputDate = new Date(inputDateString.replace(" ", "T")); // Convert to Date object

    const options: any = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    return inputDate.toLocaleString("en-US", options);
  }

  function generateText() {
    const dateInput = document.getElementById(
      "current-date"
    ) as HTMLInputElement;
    const timeInput = document.getElementById(
      "current-time"
    ) as HTMLInputElement;

    try {
      setSubject("");
      const checkText = (document.querySelector(".check-radio:checked") as any)
        .value;
      const fromText = (document.querySelector(".from-radio:checked") as any)
        .value;
      const date = formattedDate(dateInput.value, timeInput.value);
      const text = `${checkText} ${date} - ${fromText}`;

      const comment = String(
        (document.querySelector("#extra-comments") as any).value || ""
      ).trim();

      setSubject(text);
      setComment(comment);
      setSlackMessage(`${text} ${comment ? " (" + comment + ")" : ""}`);
    } catch (error) {}
  }

  function toggleSettings() {
    setSettingsContainer((prv) => !prv);
    setPunchContainer((prv) => !prv);
  }

  function saveSettings() {
    localStorage.setItem("sendgrid-token", sendgridToken);
    localStorage.setItem("slack-token", slackToken);
    localStorage.setItem("email-from", fromEmail);
    setSettingsContainer(false);
    setPunchContainer(true);
  }

  function submitPunch(e: any) {
    e.preventDefault();

    if (!subject) {
      alert("Please fill complete form");
      return;
    }

    const data = {
      slackChannel,
      slackToken,
      sendgridToken,
      fromEmail,
      toEmail,
      slackMessage,
      subject,
      body: comment,
    };

    fetch("/api/send", { body: JSON.stringify(data), method: "POST" })
      .then((res) => {
        console.log(`🚀 > fetch > res:`, res);
      })
      .catch((error) => {
        console.error(`🚀 > fetch > error:`, error);
      });
  }

  return (
    <>
      <Head>
        <title>CB Attendance App</title>
      </Head>
      <main className="main">
        <div className="description">
          <p>CB Attendance App</p>
          <span
            id="settings-button"
            style={{ fontSize: "2rem" }}
            onClick={toggleSettings}
          >
            ⚙
          </span>
        </div>

        <div className="center" style={{ width: "350px" }}>
          {!punchContainer ? null : (
            <form id="punch-form" onSubmit={submitPunch}>
              <div className="checkInOut">
                <div className="d-flex gap-3 my-3">
                  <input
                    type="radio"
                    className="btn-check check-radio check-in"
                    name="check-event"
                    value="Check-In"
                    id="check-in"
                    onChange={generateText}
                  />
                  <label
                    className="btn btn-outline-success d-flex align-items-center justify-content-center"
                    htmlFor="check-in"
                    style={{ width: "50%", height: 100 }}
                  >
                    Check-In
                  </label>
                  <input
                    type="radio"
                    className="btn-check check-radio check-out"
                    name="check-event"
                    value="Check-Out"
                    id="check-out"
                    onChange={generateText}
                  />
                  <label
                    className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                    htmlFor="check-out"
                    style={{ width: "50%", height: 100 }}
                  >
                    Check-Out
                  </label>
                </div>
              </div>
              <div className="d-flex gap-3 flex-column my-3">
                <div className="current-date">
                  <input
                    type="date"
                    id="current-date"
                    className="form-control text-center"
                    onChange={generateText}
                    required
                  />
                </div>
                <div className="current-time">
                  <input
                    type="time"
                    id="current-time"
                    className="form-control text-center"
                    onChange={generateText}
                    required
                  />
                </div>
              </div>
              <div className="d-flex gap-3 my-3">
                <input
                  type="radio"
                  className="btn-check from-radio"
                  name="options-outlined"
                  defaultValue="From Office"
                  id="from-office"
                  onChange={generateText}
                />
                <label
                  className="btn btn-outline-warning d-flex align-items-center justify-content-center"
                  htmlFor="from-office"
                  style={{ width: "50%", height: 100 }}
                >
                  From Office
                </label>
                <input
                  type="radio"
                  className="btn-check from-radio"
                  name="options-outlined"
                  defaultValue="From Home"
                  id="from-home"
                  onChange={generateText}
                />
                <label
                  className="btn btn-outline-warning d-flex align-items-center justify-content-center"
                  htmlFor="from-home"
                  style={{ width: "50%", height: 100 }}
                >
                  From Home
                </label>
              </div>

              <textarea
                id="extra-comments"
                className="form-control"
                onChange={generateText}
              ></textarea>

              <div className="my-3 color-warning">{slackMessage}</div>

              <button
                type="submit"
                className="btn btn-outline-warning w-100 mb-3"
              >
                Submit
              </button>
            </form>
          )}

          {!settingsContainer ? null : (
            <div
              id="settings-form"
              className="d-flex gap-3 flex-column my-5 w-100"
            >
              <div>
                <label htmlFor="sendgrid-token">Send Grid Token</label>
                <input
                  type="text"
                  id="sendgrid-token"
                  className="form-control"
                  value={sendgridToken}
                  onChange={(e) => setSendgridTokenInput(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="slack-token">Slack Token</label>
                <input
                  type="text"
                  id="slack-token"
                  className="form-control"
                  value={slackToken}
                  onChange={(e) => setSlackTokenInput(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email-from">Email From</label>
                <input
                  type="email"
                  id="email-from"
                  className="form-control"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>
              <button onClick={saveSettings} className="btn btn-warning w-100">
                Save
              </button>
            </div>
          )}
        </div>

        <div className="grid"></div>
      </main>
    </>
  );
}
