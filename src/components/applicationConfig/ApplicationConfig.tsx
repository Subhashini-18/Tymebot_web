import React, { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import Button from "../ui/Button";
import { useToast } from "@/context/ToastContext";

export default function VoiceFormElegant() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    version: "1.0.0",
    default_locale: "en",
    default_timezone: "UTC"
  });

  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
const { showToast } = useToast();

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      setTranscript(text.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  /* ✅ Multi-word voice extraction */
  useEffect(() => {
    const t = transcript.toLowerCase();

    // Extract phrase using ANY of the keyword variations
    const extractMulti = (keywords: string[]) => {
      const pattern = new RegExp(
        `(?:${keywords.join("|")})\\s+([^]+?)(?=\\s+(name is|my name is|application name is|code is|app code is|application code is|version is|the code is|app version is|application version is)|$)`,
        "i"
      );
      const match = t.match(pattern);
      return match ? match[1].trim() : "";
    };
    const capitalizeWords = (str: string) =>
      str
        .split(" ")
        .filter(w => w.trim() !== "")
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    const updates: any = {};

    // ✅ Define at least 3 keywords for each input
    const nameKeywords = ["name is", "my name is", "application name is"];
    const codeKeywords = ["code is", "application code is", "app code is", "my code is", "the code is"];
    const versionKeywords = ["version is", "app version is", "application version is"];

    const n = extractMulti(nameKeywords);
    const c = extractMulti(codeKeywords);
    const v = extractMulti(versionKeywords);

    if (n) {
      const cleaned = n.replace(/[^a-z0-9 ]/gi, "");
      updates.name = capitalizeWords(cleaned);
    }
    if (c) updates.code = c.replace(/[^a-z0-9]/gi, "");
    if (v) updates.version = v.replace(/[^a-z0-9.]/gi, "");

    if (Object.keys(updates).length > 0)
      setForm(prev => ({ ...prev, ...updates }));
  }, [transcript]);


  /* ✅ Submit handler */
  const handleSubmit = async () => {
    console.log("Submitting Data:", form);
 stopListening();
  setListening(false);
    try {
      const response = await fetch(
        "http://192.168.1.17:9091/api/config/create_application_config",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();
      console.log("✅ API Response:", data);
            setForm({ name: "", code: "", version: "1.0.0", default_locale: "en", default_timezone: "UTC" });
setTranscript("");
showToast({
      message: "Successfully submitted!",
      type: "success"
    });
      // alert("Successfully submitted!");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      // alert("Error submitting the form.");
        showToast({
      message: "Error submitting the form.",
      type: "error"
    });
    }
   
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h2 className="text-2xl font-semibold  mb-3">Application Config</h2>

      <div className="flex flex-col items-center justify-center mt-4 gap-3">
        <div className="relative flex items-center justify-center">
          {listening && (
            <div className="absolute w-24 h-24 rounded-full opacity-40 animate-pulse" />
          )}

          <Button
            onClick={listening ? stopListening : startListening}
            className={`relative w-16 h-16 rounded-full text-white shadow-xl flex items-center justify-center transition-all
                ${listening ? "animate-mic-on" : "hover:bg-slate-900"}`}
          >
            <Mic size={32} />
          </Button>
        </div>

        {!listening && (
        <div className="text-sm font-semibold text-gray-600 animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-red-800 rounded-full animate-ping"></div>
            Tap to Speak...
          </div>
        )}

        {listening && (
          <div className="text-sm font-semibold text-blue-600 animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-green-900 rounded-full animate-ping"></div>
            Listening…
          </div>
        )}
      </div>

      <div className="mt-5 w-full flex">
        <textarea
          value={transcript}
          readOnly
          placeholder="Speak like: 'name is John Doe code is xyz123 version is 1.0.9'"
          className="w-full h-24 rounded-xl border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      <div className="mt-5 space-y-4">
       <Field
  label="Name"
  value={form.name}
  onChange={(v) =>
    setForm({
      ...form,
      name: v.replace(/[0-9]/g, "") // remove numbers
    })
  }
/>

        <Field
          label="Code"
          value={form.code}
          onChange={(v) => setForm({ ...form, code: v })}
        />
        <Field
          label="Version"
          value={form.version}
          onChange={(v) => setForm({ ...form, version: v })}
        />
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition"
      >
        Submit
      </Button>
    </div>
  );
}

/* ✅ Reusable Field component */
function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-gray-800 font-semibold font-serif">
        {label}
        <span className="text-red-600 ml-1">*</span>
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
      />
    </div>
  );
}
