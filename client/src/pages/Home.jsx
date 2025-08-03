import React, { useEffect, useState } from "react";
import axiosbase from "../../axiosbasa";
import Navbar from "../components/Navbar";
import Btnnavbar from "../components/Btnnavbar";
import LatestMoviesSection from "../components/LatestMoviesSection";

function Home() {
  const [getData, setGetData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosbase.get("movie/getmovie");
        setGetData(res.data); // storing actual movie list
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);
  const [filter, setFiler] = useState("");
  const [search, setSearch] = useState("");
  return (
    <div>
      <Navbar setSearchh={setSearch} />
      <Btnnavbar onFilter={setFiler} />
      <LatestMoviesSection filer={filter} search={search} resData={getData} />
    </div>
  );
}

export default Home;
