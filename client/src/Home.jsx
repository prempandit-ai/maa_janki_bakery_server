import { useContext, useEffect, useState } from "react";
import Hero from "./components/Hero";
import Category from "./components/Category";
import BestSeller from "./components/BestSeller";
import ProductCard from "./components/ProductCard";
import RecommendationSection from "./components/RecommendationSection";
import { AppContext } from "./AppContext";


const Home =()=>
{
  const { axios, user } = useContext(AppContext);
  const [userRecs, setUserRecs] = useState([]);

  useEffect(() => {
    const fetchUserRecs = async () => {
      try {
        const { data } = await axios.get("/api/recommend/user");
        if (data.success) {
          setUserRecs(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch user recommendations", error);
      }
    };
    fetchUserRecs();
  }, [user]);

  return(
    <div className="mt-4 md:mt-10">
   <Hero/>
   <Category/>
   <BestSeller/>
   <ProductCard/>  
   <RecommendationSection title="Recommended for You" products={userRecs} />
      </div>
  );
}
export default Home;




