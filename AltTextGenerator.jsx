
import React, { useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

export default function AltTextGenerator() {
  const [keywords, setKeywords] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [altTexts, setAltTexts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [visionAttributes, setVisionAttributes] = useState([]);
  const [imageElement, setImageElement] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    mobilenet.load().then(setModel);
  }, []);

  const analyzeImage = async (img) => {
    if (model && img) {
      try {
        const predictions = await model.classify(img);
        const topAttributes = predictions
          .filter(p => p.probability > 0.6)
          .slice(0, 3)
          .map(p => p.className);
        setVisionAttributes(topAttributes);
      } catch (error) {
        console.error("Vision model error:", error);
        setVisionAttributes(["product detail", "material texture"]);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          setImageElement(img);
          analyzeImage(img);
        };
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      alert('Please upload a valid JPG, PNG, or WebP image.');
    }
  };

  const generateAltTexts = () => {
    if (!keywords || !productDescription) {
      setAltTexts(['Please enter both keywords and product description.']);
      return;
    }

    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    const description = productDescription.trim();
    const visualHighlights = visionAttributes.join(', ');

    let primaryKeyword = keywordList[0] || '';
    let secondaryKeyword = keywordList[1] || '';
    let shortDesc = description.length > 60 ? description.slice(0, 60).trim() + '…' : description;

    const variations = [
      `${shortDesc}. Features ${visualHighlights}. Includes ${primaryKeyword}${secondaryKeyword ? ` and ${secondaryKeyword}` : ''}.`,
      `Product with ${visualHighlights}, crafted for ${primaryKeyword} appeal. ${shortDesc}.`,
      `${primaryKeyword} product showcasing ${visualHighlights} and ${secondaryKeyword}. Ideal for ${shortDesc}`
    ];

    const optimized = variations.map(v => v.length > 125 ? v.slice(0, 122) + '…' : v);
    setAltTexts(optimized);
  };

  const resetFields = () => {
    setKeywords('');
    setProductDescription('');
    setAltTexts([]);
    setImagePreview(null);
    setVisionAttributes([]);
    setImageElement(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <label>Upload Image (JPG, PNG, WebP)</label>
        <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} />
        {imagePreview && (
          <img src={imagePreview} alt="Uploaded preview" className="mt-3 w-full border rounded-xl" />
        )}
      </div>

      <div>
        <label>Keywords (comma-separated)</label>
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="e.g., eco-friendly, organic cotton, sustainable"
        />
      </div>

      <div>
        <label>Product Description</label>
        <input
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Paste your product description here..."
        />
      </div>

      <button onClick={generateAltTexts}>Generate Alt Text</button>
      <button onClick={resetFields}>Refresh</button>

      {altTexts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p>Generated Alt Text Variations:</p>
          {altTexts.map((text, idx) => (
            <div key={idx} className="p-3 bg-gray-100 rounded-xl text-sm">
              <p>{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
