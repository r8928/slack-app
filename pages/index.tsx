import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { Settings } from "src/components/Settings";

export default function Home() {
  // constants
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // init vars
  const [settingsContainer, setSettingsContainer] = useState(false);
  const [punchContainer, setPunchContainer] = useState(true);
  const [sendgridToken, setSendgridTokenInput] = useState("");
  const [slackToken, setSlackTokenInput] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [slackMessage, setSlackMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [comment, setComment] = useState("");

  // load local storage
  useEffect(() => {
    getTokens();
    getDates();
    generateText();
  }, []);

  const hasConfig = useMemo(
    () => sendgridToken && slackToken && fromEmail,
    [sendgridToken, slackToken, fromEmail]
  );

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

  function getTokens() {
    setSendgridTokenInput(localStorage.getItem("sendgrid-token") || "");
    setSlackTokenInput(localStorage.getItem("slack-token") || "");
    setFromEmail(localStorage.getItem("email-from") || "");
    setToEmail(
      localStorage.getItem("to-email") || process.env.NEXT_PUBLIC_TO_EMAIL || ""
    );
    setSlackChannel(
      localStorage.getItem("slack-channel") ||
        process.env.NEXT_PUBLIC_SLACK_CHANNEL ||
        ""
    );
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
      if (time) {
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

        generateText();
      }
    }
  }

  function addOneMinute(): void {
    const timeEl = document.getElementById("current-time") as HTMLInputElement;
    if (timeEl) {
      const time = timeEl.value;
      if (time) {
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

        generateText();
      }
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

    if (
      dateInput &&
      dateInput.value &&
      timeInput &&
      timeInput.value &&
      checkText &&
      fromText
    ) {
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
      setSubject("");
      setSlackMessage("");
      console.log(`🚀 >`, { dateInput, timeInput, checkText, fromText });
    }
  }

  function submitPunch(e: any) {
    e.preventDefault();

    if (!subject) {
      setError("Please fill in the form.");
      return;
    }

    setError("");
    setLoading(true);
    setSuccess(false);

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
      .then((res) => res.json())
      .then((res) => {
        if (!res?.success) {
          setError(JSON.stringify(res));
          console.log(`🚀 > /api/send > res:`, res);
        } else {
          setSuccess(true);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(JSON.stringify(error));
        console.error(`🚀 > /api/send > error:`, error);
      });
  }

  return (
    <>
      <Head>
        <title>CB Attendance App</title>
      </Head>

      <main className="main mb-5">
        <div className="flex justify-between font-mono mb-[1rem] px-[2rem] py-4 mt-3 max-w-[550px] mx-auto shadow-2xl text-orange-600 backdrop-blur-lg rounded-md">
          <h1 className="text-2xl font-black">CB Attendance App</h1>
          <span
            id="settings-button"
            className="text-2xl cursor-pointer"
            onClick={toggleSettings}
          >
            ⚙️
          </span>
        </div>

        {!punchContainer && !success ? null : (
          <form
            id="punch-form"
            onSubmit={submitPunch}
            className="rounded-lg p-5 shadow-2xl mx-auto w-[320px] flex flex-col gap-5 backdrop-blur-md"
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
                  className="h-[100px] w-[135px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                      text-green-800 border-2 bg-green-100 border-green-200
                      hover:bg-green-200
                      peer-checked:ring-4 peer-checked:ring-green-300 peer-checked:bg-green-300 peer-checked:border-green-600
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
                  className="h-[100px] w-[135px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                  text-red-800 border-2 bg-red-100 border-red-200
                  hover:bg-red-200
                  peer-checked:ring-4 peer-checked:ring-red-300 peer-checked:bg-red-300 peer-checked:border-red-600
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
                  className="h-[100px] w-[135px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                    text-yellow-800 border-2 bg-yellow-100 border-yellow-200
                    hover:bg-yellow-200
                    peer-checked:ring-4 peer-checked:ring-yellow-300 peer-checked:bg-yellow-300 peer-checked:border-yellow-600
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
                  className="h-[100px] w-[135px] cursor-pointer rounded-lg px-5 py-2.5 flex items-center justify-center
                    text-blue-800 border-2 bg-blue-100 border-blue-200
                    hover:bg-blue-200
                    peer-checked:ring-4 peer-checked:ring-blue-300 peer-checked:bg-blue-300 peer-checked:border-blue-600
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

            <div className="border-2 border-gray-400 rounded-lg p-3 text-gray-800">
              {slackMessage}
            </div>

            {!error ? null : (
              <div className="border-2 rounded-lg p-3 border-red-800 bg-red-100 text-red-900">
                {error}
              </div>
            )}

            {!hasConfig || !slackMessage ? (
              /* bg-blue-700 */
              <button
                type="submit"
                disabled={true}
                className="w-[100%]
               rounded-lg px-5 py-2.5
               border-2
               border-gray-400 disabled:bg-gray-300 text-gray-500
               "
              >
                {!hasConfig ? "Configs not set" : "Please fill all fields"}
              </button>
            ) : success ? (
              /* bg-blue-700 */
              <button
                type="submit"
                disabled={true}
                className="w-[100%]
               rounded-lg px-5 py-2.5
               border-2 border-green-700
               disabled:bg-green-100 disabled:ring-0 disabled:cursor-not-allowed
               "
              >
                ✔
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-[100%] text-white bg-orange-700
                 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300
                 rounded-lg px-5 py-2.5
                 dark:bg-orange-600 dark:hover:bg-orange-700 focus:outline-none dark:focus:ring-orange-800
                 disabled:bg-gray-400 disabled:ring-0 disabled:cursor-not-allowed
                 "
              >
                Send{loading && "ing..."}
              </button>
            )}
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
      </main>
    </>
  );
}
