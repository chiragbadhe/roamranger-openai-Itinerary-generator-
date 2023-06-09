import { useState, useRef } from "react";
import Head from "next/head";
import { countryList } from "../assets/countryList";
import toast, { Toaster } from "react-hot-toast";

const popularCountries = ["India", "Italy", "France", "Spain", "Thailand"];
const months = [
  "Any month",
  "January",
  "Februrary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const basePrompt = "Write me an itinerary for";
const addHotelsPrompt =
  "- Hotel (prefer not to change it unless traveling to another city)\n";
const addRestaurantsPrompt =
  "- 2 Restaurants, one for lunch and another for dinner, with shortened Google Map links\n";

const Home = () => {
  const [duration, setDuration] = useState(7);
  const [hotels, setHotels] = useState(true);
  const [restaurants, setRestaurants] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Any month");

  const [apiOutput, setApiOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const divRef = useRef(null);

  const scrollToDiv = () => {
    window.scrollTo({
      top: divRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  const callGenerateEndpoint = async () => {
    setIsGenerating(true);
    let prompt = `${basePrompt} ${duration} days to  ${selectedCountry} in the coming ${selectedMonth}. Describe the weather that month, and also 5 things to take note about this country's culture. Keep to a maximum travel area to the size of Hokkaido, if possible, to minimize traveling time between cities.\n\nFor each day, list me the following:\n- Attractions suitable for that season\n`;
    if (hotels) prompt += addHotelsPrompt;
    if (restaurants) prompt += addRestaurantsPrompt;
    prompt +=
      "and give me a daily summary of the above points into a paragraph or two.\n";

    console.log("Calling OpenAI with prompt...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { output } = data;
      console.log("OpenAI replied...", output.text);

      setApiOutput(`${output.text}`);
      setIsGenerating(false);
      scrollToDiv();
    } catch (error) {
      console.error("Error calling API:", error);
      // Handle error here, such as setting an error message state
      toast.error("Too many requests");
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>RoamRanger</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="root">
        <Toaster
          toastOptions={{
            position: "top-right",
            success: {
              style: {
                background: "green",
              },
            },
            error: {
              style: {
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
              },
            },
          }}
        />

        <div className="flex max-[600px]:flex-col w-full">
          <div className="container-right" ref={divRef}>
            {apiOutput && (
              <div className="output">
                <div className="output-header-container">
                  <div className="output-header">
                    <h3>Your Itinerary</h3>
                  </div>
                </div>
                <div className="output-content">
                  <p>{apiOutput}</p>
                </div>
              </div>
            )}
          </div>
          <div className="container-left">
            <div className="header">
              <div className="header-title">
                <h1>RoamRanger ✨</h1>
              </div>
              <div className="header-subtitle mt-[5px]">
                <h2>
                  Give me some details and I'll ✨ an itinerary just for you!
                </h2>
              </div>
            </div>
            <div className=" space-y-[20px]">
              <div className="flex items-center">
                <span>Where do you want to go?</span>
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="prompt-box"
              >
                <option value="">Select a country</option>
                {countryList.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <div className="areas-of-interests">
                <div
                  style={{
                    color: "#fff",
                    display: "inline-block",
                    marginRight: ".8rem",
                  }}
                >
                  {popularCountries.map((i) => (
                    <button
                      className={`item ${
                        selectedCountry.includes(i) && "selected"
                      }`}
                      key={i}
                      onClick={() => {
                        setSelectedCountry(i);
                      }}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex w-100 mt-4">
                <div
                  className="flex-none mr-6 flex-col items-start"
                  style={{ display: "flex", width: "180px" }}
                >
                  <div className="flex items-center mb-2">
                    <span>How many days?</span>
                  </div>
                  <input
                    type="number"
                    className="rounded block"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ width: "180px" }}
                  />
                </div>
                <div className="ml-4">
                  <div className="flex items-center mb-2">
                    <span>Month</span>
                  </div>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="prompt-box"
                  >
                    <option value="">Select a month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <div>
                  <div className="flex items-center mb-2">
                    <span>Recommendations?</span>
                  </div>
                  <div>
                    <label className="inline-flex items-center mr-8">
                      <input
                        type="checkbox"
                        className="rounded checked:bg-blue-500"
                        value={restaurants}
                        checked={restaurants}
                        onChange={(e) => setRestaurants(e.target.checked)}
                      />
                      <span className="ml-2">🍔 Restaurants</span>
                    </label>

                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded checked:bg-blue-500"
                        value={hotels}
                        onChange={(e) => setHotels(e.target.checked)}
                        checked={hotels}
                      />
                      <span className="ml-2">🏨 Hotels</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <button
                  className="border rounded-[5px] bg-white/10 border-white/10 hover:bg-white/20 w-full disable "
                  onClick={callGenerateEndpoint}
                  disabled={isGenerating}
                >
                  <div className="w-full px-[15px] py-[10px]">
                    {isGenerating ? (
                      <div>
                        <span className="loader mr-2"></span>
                        <span>Generating your itinerary...</span>
                      </div>
                    ) : (
                      <span className="font-semibold">Generate</span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
          <p className="absolute bottom-[20px] right-[20px]">
            Crafted with 💜 by{" "}
            <span className="text-purple-500">
              <a href="https://github.com/chiragbadhe" target="_blank">
                @ch1rag
              </a>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
