import {useContext} from "react";
import {AppContext} from "../AppContext";
import {useParams} from "react-router-dom";
import {categories} from "../assets/assets";
import ProductCard from "../components/ProductCard";
import BackButton from "../components/BackButton";


const ProductCategory=()=>{
  const {products,navigate}=useContext(AppContext);
  const {category} =useParams();
  const searchCategory=categories.find(
   (item)=>item.path.toLowerCase()===category.toLowerCase()
  );

  const filteredProducts=products.filter(
     (product)=>product.category.toLowerCase()===category.toLowerCase()
 );
  
 return ( <div className="mt-4">
    <BackButton />
    {searchCategory&&(
    <div className="flex flex-col items-start mt-12">
    <h1 className="text-2xl md:text-4xl font-semibold">{searchCategory.text.toUpperCase()}</h1>
  </div>
  )}
  {
     filteredProducts.length>0?(
    <div>
      <div className="my-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 items-center justify-center">
          {
            filteredProducts.map((product,index)=>(
         <ProductCard key={index} product={product} />
       )
      )    
     }
      </div>
    </div>
   ):(
     
      <h1 className="text-2xl md:text-4xl font-semibold mt-12"> No Product Found </h1>

   )
  }
  </div>
 );
  
};

export default ProductCategory;




































