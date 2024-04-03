import Head from "next/head";
import { useEffect, useState } from "react";
import { Settings } from "src/components/Settings";

export default function Home() {
  // constants
  const toEmail = process.env.NEXT_PUBLIC_TO_EMAIL;
  const slackChannel = process.env.NEXT_PUBLIC_SLACK_CHANNEL;

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
    getTokens();
    getDates();
    generateText();
  }, []);

  function getTokens() {
    setSendgridTokenInput(localStorage.getItem("sendgrid-token") || "");
    setSlackTokenInput(localStorage.getItem("slack-token") || "");
    setFromEmail(localStorage.getItem("email-from") || "");
  }

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

  function subtractOneMinute(): void {
    const timeEl = document.getElementById("current-time") as HTMLInputElement;
    if (timeEl) {
      const time = timeEl.value;

      const [hours, minutes] = time.split(":");
      const currentTime = new Date();
      currentTime.setHours(Number(hours));
      currentTime.setMinutes(Number(minutes));
      currentTime.setMinutes(currentTime.getMinutes() - 1);

      timeEl.value = currentTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  function addOneMinute(): void {
    const timeEl = document.getElementById("current-time") as HTMLInputElement;
    if (timeEl) {
      const time = timeEl.value;

      const [hours, minutes] = time.split(":");
      const currentTime = new Date();
      currentTime.setHours(Number(hours));
      currentTime.setMinutes(Number(minutes));
      currentTime.setMinutes(currentTime.getMinutes() + 1);

      timeEl.value = currentTime.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
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
    const checkText = document.querySelector(".check-radio:checked") as any;
    const fromText = document.querySelector(".from-radio:checked") as any;

    if (dateInput && timeInput && checkText && fromText) {
      setSubject("");

      const date = formattedDate(dateInput.value, timeInput.value);
      const text = `${checkText.value} ${date} - ${fromText.value}`;

      const comment = String(
        (document.querySelector("#extra-comments") as any).value || ""
      ).trim();

      setSubject(text);
      setComment(comment);
      setSlackMessage(`${text} ${comment ? " (" + comment + ")" : ""}`);
      console.log(`🚀 > generateText > text:`, text);
    } else {
      console.log(`🚀 >`, { dateInput, timeInput, checkText, fromText });
    }
  }

  function toggleSettings() {
    setSettingsContainer((prv) => !prv);
    setPunchContainer((prv) => !prv);
    setTimeout(() => {
      try {
        getTokens();
        getDates();
        generateText();
      } catch (error) {}
    });
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

    fetch("/api/send", {
      body: JSON.stringify(data),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
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
        <div className="flex justify-between font-mono mb-[2rem]">
          <h1 className="text-2xl">CB Attendance App</h1>
          <span
            id="settings-button"
            className="text-2xl cursor-pointer"
            onClick={toggleSettings}
          >
            ⚙️
          </span>
        </div>

        {!punchContainer ? null : (
          <form
            id="punch-form"
            onSubmit={submitPunch}
            className="border rounded-lg p-3 border-yellow-600 mx-auto w-[350px] flex flex-col gap-5"
          >
            <div className="flex gap-3">
              <div>
                <input
                  type="radio"
                  className="hidden peer check-radio"
                  name="check-radio"
                  value="Check-In"
                  id="check-in"
                  onChange={generateText}
                />
                <label
                  className="h-[100px] w-[150px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                      text-green-700 border-2 bg-white border-green-700
                      hover:bg-green-800 hover:text-white
                      peer-checked:ring-4 peer-checked:ring-green-300 peer-checked:bg-green-700 peer-checked:text-white
                      "
                  htmlFor="check-in"
                >
                  Check-In
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  className="hidden peer check-radio"
                  name="check-radio"
                  value="Check-Out"
                  id="check-out"
                  onChange={generateText}
                />
                <label
                  className="h-[100px] w-[150px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                      text-red-700 border-2 bg-white border-red-700
                      hover:bg-red-800 hover:text-white
                      peer-checked:ring-4 peer-checked:ring-red-300 peer-checked:bg-red-700 peer-checked:text-white
                      "
                  htmlFor="check-out"
                >
                  Check-Out
                </label>
              </div>
            </div>

            <div className="current-date">
              <input
                type="date"
                id="current-date"
                className="w-[100%] text-center border-2 rounded-lg border-gray-400 p-2"
                onChange={generateText}
                required
              />
            </div>

            <div className="current-time flex gap-2">
              <button
                type="button"
                className="p-2 border-2 border-transparent hover:border-gray-400 rounded-lg"
                onClick={() => subtractOneMinute()}
              >
                ➖
              </button>

              <input
                type="time"
                id="current-time"
                className="w-[100%] text-center border-2 rounded-lg border-gray-400 p-2"
                onChange={generateText}
                required
              />

              <button
                type="button"
                className="p-2 border-2 border-transparent hover:border-gray-400 rounded-lg"
                onClick={() => addOneMinute()}
              >
                ➕
              </button>
            </div>

            <div className="flex gap-3">
              <div>
                <input
                  type="radio"
                  className="hidden peer from-radio"
                  name="from-radio"
                  defaultValue="From Office"
                  id="from-office"
                  onChange={generateText}
                />
                <label
                  className="h-[100px] w-[150px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                    text-yellow-800 border-2 bg-white border-yellow-200
                    hover:bg-yellow-100
                    peer-checked:ring-4 peer-checked:ring-yellow-300 peer-checked:bg-yellow-200
                    "
                  htmlFor="from-office"
                >
                  From Office
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  className="hidden peer from-radio"
                  name="from-radio"
                  defaultValue="From Home"
                  id="from-home"
                  onChange={generateText}
                />
                <label
                  className="h-[100px] w-[150px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                    text-blue-800 border-2 bg-white border-blue-200
                    hover:bg-blue-100
                    peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:bg-blue-200
                    "
                  htmlFor="from-home"
                >
                  From Home
                </label>
              </div>
            </div>

            <textarea
              id="extra-comments"
              className="w-[100%] border-2 rounded-lg border-gray-400 p-2"
              onChange={generateText}
            ></textarea>

            <div className="color-warning">{slackMessage}</div>

            <button
              type="submit"
              className="w-[100%] text-white bg-blue-700
                 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300
                 rounded-lg px-5 py-2.5
                 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              Submit
            </button>
          </form>
        )}

        {!settingsContainer ? null : (
          <Settings
            setSendgridTokenInput={setSendgridTokenInput}
            setSlackTokenInput={setSlackTokenInput}
            setFromEmail={setFromEmail}
            onClose={toggleSettings}
          />
        )}

        <div className="grid"></div>
      </main>
    </>
  );
}
