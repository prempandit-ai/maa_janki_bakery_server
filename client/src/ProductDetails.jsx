import { useState, useEffect, useContext } from "react";
import { AppContext } from "./AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "./assets/assets";
import RecommendationSection from "./components/RecommendationSection";
import { getImageUrl } from "./utils/imageUrl";

const ProductDetails = () => {
  const { products, navigate, addToCart, trackInteraction, axios, backendUrl } = useContext(AppContext);
  const { id } = useParams();

  const [thumbnail, setThumbnail] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);

  const product = products.find((product) => product._id === id);

  // Set initial thumbnail
  useEffect(() => {
    if (product?.images?.[0]) {
      const firstImage = product.images[0];
      setThumbnail(getImageUrl(firstImage, backendUrl));
    } else {
      setThumbnail(null);
    }

    if (product) {
        trackInteraction(product._id, "view");
        
        // Fetch similar products
        const fetchSimilar = async () => {
            try {
                const { data } = await axios.get(`/api/recommend/similar/${product._id}`);
                if (data.success) {
                    setSimilarProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch similar products", error);
            }
        };
        fetchSimilar();
    }
  }, [product, id]);

  if (!product) return <p>Product not found</p>;

  return (
    <div className="mt-1 md:mt-8">
      {/* Breadcrumb */}
      <div className="text-[10px] md:text-sm text-gray-400 md:text-gray-500 flex items-center gap-1 flex-wrap mb-2">
        <Link to="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:underline">Products</Link>
        <span>/</span>
        <Link to={`/products/${product.category.toLowerCase()}`} className="hover:underline">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-indigo-500 font-medium truncate max-w-[120px] md:max-w-none">{product.name}</span>
      </div>

      {/* Side-by-side: image left, details right */}
      <div className="flex flex-row gap-3 md:gap-16 mt-0 md:mt-6">
        {/* Image column */}
        <div className="flex flex-col gap-1.5 md:gap-3 flex-shrink-0">
          {/* Main image */}
          <div className="border border-gray-200 w-[165px] h-[165px] md:w-full md:max-w-md md:aspect-square rounded-lg overflow-hidden bg-white flex items-center justify-center">
            {thumbnail && (
              <img src={thumbnail} alt="Selected product" className="w-full h-full object-cover" />
            )}
          </div>
          {/* Thumbnails row */}
          <div className="flex flex-row md:flex-row gap-1 md:gap-2 overflow-x-auto">
            {product.images?.map((image, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(getImageUrl(image, backendUrl))}
                className="border w-11 h-11 md:w-24 md:h-24 flex-shrink-0 border-gray-200 rounded overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <img src={getImageUrl(image, backendUrl)} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Details column */}
        <div className="flex flex-col justify-between flex-1 min-w-0 md:w-1/2">
          <div>
            <h1 className="text-base md:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-0.5 mt-0.5 md:mt-2">
              {Array(5).fill("").map((_, i) => (
                <img key={i} src={i < product.rating ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-2.5 md:w-4" />
              ))}
              <p className="text-[10px] md:text-sm ml-1 md:ml-2 text-gray-500 md:font-medium md:text-gray-600">({product.rating})</p>
            </div>

            <div className="mt-2 md:mt-4 bg-indigo-50/60 border border-indigo-100/50 p-2 md:p-3 rounded-lg md:w-fit md:min-w-[200px]">
              <p className="text-[10px] md:text-xs text-gray-400 md:text-gray-500 line-through">MRP: ₹{product.price}</p>
              <p className="text-base md:text-2xl font-bold text-indigo-600">Price: ₹{product.offerPrice}</p>
              <span className="text-[9px] md:text-[10px] text-gray-400 md:font-medium">(incl. all taxes)</span>
            </div>

            <p className="text-xs md:text-base font-semibold mt-2 md:mt-6 text-gray-700 md:text-gray-800">About Product</p>
            <ul className="list-disc ml-3 md:ml-4 mt-0.5 md:mt-2 text-gray-500 md:text-gray-600 space-y-0 md:space-y-1 text-[10px] md:text-sm leading-snug">
              {Array.isArray(product.description)
                ? product.description.map((desc, i) => <li key={i}>{desc}</li>)
                : product.description
                ? product.description.split("\n").map((line, i) => <li key={i}>{line}</li>)
                : <li>No description available</li>}
            </ul>
          </div>

          <div className="flex items-center mt-3 md:mt-10 gap-1.5 md:gap-3 text-xs md:text-base">
            <button
              onClick={() => addToCart(product._id)}
              className="flex-1 py-1.5 md:py-3 cursor-pointer font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Add to Cart
            </button>
            <button
              onClick={() => { addToCart(product._id); navigate("/cart"); }}
              className="flex-1 py-1.5 md:py-3 cursor-pointer font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      <RecommendationSection title="Similar Products" products={similarProducts} />
    </div>
  );
};

export default ProductDetails;
