import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const Webcam = () => {
  const [mood, setMood] = useState("Detecting...");
  const videoRef = useRef(null);

  useEffect(() => {
    const getvideo = async () => {
      if (!videoRef.current) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };

    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      getvideo();
    };

    loadModels();
  }, []);

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (!videoRef.current) return;
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const moodDetected = Object.keys(expressions).reduce((a, b) =>
          expressions[a] > expressions[b] ? a : b
        );
        setMood(moodDetected);
      }
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <div className="relative w-[700px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        <video
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          className="w-full h-full object-cover"
        />
        {/* Mood badge */}
        <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-lg font-semibold">
          Mood: {mood}
        </div>
      </div>
    </div>
  );
};

export default Webcam;
