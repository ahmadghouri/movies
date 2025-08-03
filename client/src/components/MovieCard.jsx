import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactForm from "../pages/Contact";

const MovieCard = ({ title, image, id }) => {
  const navtion = useNavigate();
  const [delit, setDelit] = useState("");
  function hanleClick(id) {
    console.log(id);
    setDelit(id);
    navtion(`/moviedetail/${id}`);
  }
  return (
    <div
      className="bg-gray-800 rounded shadow overflow-hidden"
      onClick={() => hanleClick(id)}
    >
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-2">
        <h2 className="text-white text-sm font-semibold">{title}</h2>
      </div>
    </div>
  );
};

export default MovieCard;
