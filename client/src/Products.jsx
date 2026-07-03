import { useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import ProductCard from "./components/ProductCard";
import BackButton from "./components/BackButton";

const Products = () => {
  const { products, searchQuery } = useContext(AppContext);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      setFilteredProducts(
        products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  return (
    <div className="mt-4">
      <BackButton />
      <h1 className="text-3xl lg:text-4xl font-medium mt-12">All Products</h1>
      <div className="my-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 items-center justify-center">
        {filteredProducts
          .filter((product) => product.inStock)
          .map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
    </div>
  );
};

export default Products;
