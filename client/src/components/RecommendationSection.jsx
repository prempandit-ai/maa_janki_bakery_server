import ProductCard from "./ProductCard";

const RecommendationSection = ({ title, products: recommendedProducts }) => {
  if (!recommendedProducts || recommendedProducts.length === 0) return null;

  return (
    <div className="mt-8 md:mt-16">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">{title}</h2>
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 my-6">
        {recommendedProducts.slice(0, 6).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;
