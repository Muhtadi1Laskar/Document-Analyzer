import { useState } from "react";
import "../App.css";

const PlagiarismChecker = () => {
  const [fileOne, setFileOne] = useState(null);
  const [fileTwo, setFileTwo] = useState(null);
  const [checkerType, setCheckerType] = useState("cosine-similarity");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleCheckerTypeChange = (e) => {
    setCheckerType(e.target.value);
  };

  const handleSubmit = async () => {
    if (!fileOne || !fileTwo) {
      alert("Please upload both files!");
      return;
    }

    const formData = new FormData();
    formData.append("fileOne", fileOne);
    formData.append("fileTwo", fileTwo);
    formData.append("checkerType", checkerType);

    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("https://text-analyzer-flame.vercel.app/api/plagrismChecker", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch similarity result");
      }

      const data = await response.json();
      if (checkerType === "minhash") {
        data.similarity = data.similarity.toFixed(0);
      } else {
        data.similarity = data.similarity.toFixed(3);
      }
      setResult(data);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Plagiarism Checker</h1>
      <div className="file-input">
        <label htmlFor="fileOne">Upload Text File 1:</label>
        <input type="file" id="fileOne" onChange={(e) => handleFileUpload(e, setFileOne)} accept=".txt" />
      </div>
      <div className="file-input">
        <label htmlFor="fileTwo">Upload Text File 2:</label>
        <input type="file" id="fileTwo" onChange={(e) => handleFileUpload(e, setFileTwo)} accept=".txt" />
      </div>
      <div className="select-input">
        <label htmlFor="checkerType">Select Plagiarism Checker Type:</label>
        <select id="checkerType" value={checkerType} onChange={handleCheckerTypeChange}>
          <option value="" disabled>Select a value</option>
          <option value="cosine-similarity">Cosine Similarity</option>
          <option value="minhash">Min-Hash</option>
          <option value="rabin-karp">Rabin-Karp</option>
        </select>
      </div>
      <button onClick={handleSubmit} className="submit-button" disabled={loading}>
        {loading ? "Checking..." : "Check Similarity"}
      </button>

      {loading && <div className="spinner"></div>}

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="result">
          <h2>Similarity: {result.similarity}%</h2>
          <div className="analysis">
            <h3>Text File 1:</h3>
            <ul>
              <li>Average Word Length: {result.knownText.avgWordLength.toFixed(2)}</li>
              <li>Average Sentence Length: {result.knownText.avgSentenceLength.toFixed(2)}</li>
              <li>Stop Word Frequency: {(result.knownText.stopWordFrequency * 100).toFixed(2)}%</li>
              <li>Vocabulary Richness: {(result.knownText.vocabularyRichness * 100).toFixed(2)}%</li>
            </ul>
          </div>
          <div className="analysis">
            <h3>Text File 2:</h3>
            <ul>
              <li>Average Word Length: {result.unknownText.avgWordLength.toFixed(2)}</li>
              <li>Average Sentence Length: {result.unknownText.avgSentenceLength.toFixed(2)}</li>
              <li>Stop Word Frequency: {(result.unknownText.stopWordFrequency * 100).toFixed(2)}%</li>
              <li>Vocabulary Richness: {(result.unknownText.vocabularyRichness * 100).toFixed(2)}%</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlagiarismChecker;
