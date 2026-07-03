import {useContext} from "react";
import {AppContext} from "../AppContext";
import ProductCard from "./ProductCard";


 const BestSeller=()=>{
    const {products}=useContext(AppContext);  
  return(
     <div className="mt-8 md:mt-16">
     <p className="text-xl md:text-3xl font-semibold">Deal of the day</p>
    <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 my-6">
    {
     products.filter((product)=>product.inStock && product.isDealOfDay)
     .slice(0,8)
     .map((product,index)=>
    (
      <ProductCard key={index} product={product}/> 
    ))
    }
   </div>
    

</div>
   );
 };
export default BestSeller;